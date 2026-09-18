import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";

@Injectable()
export class CxcService {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingInvoices(companyId: string, customerId?: string) {
    return this.prisma.invoice.findMany({
      where: {
        companyId,
        ...(customerId && { customerId }),
        status: { not: "VOID" },
        // Traer facturas donde (total - amountPaid) > 0
      },
      include: {
        customer: true,
      },
      orderBy: { invoiceDate: "asc" },
    }).then(invoices => invoices.filter(inv => Number(inv.total) - Number(inv.amountPaid) > 0));
  }

  async getPayments(companyId: string) {
    return this.prisma.customerPayment.findMany({
      where: { companyId },
      include: {
        customer: true,
        items: { include: { invoice: true } },
      },
      orderBy: { paymentDate: "desc" },
    });
  }

  async registerPayment(companyId: string, dto: any) {
    // 1. Validar facturas
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException("Debe incluir al menos una factura a pagar");
    }

    const invoicesToUpdate: any[] = [];
    let totalApplied = 0;

    for (const item of dto.items) {
      const invoice = await this.prisma.invoice.findUnique({ where: { id: item.invoiceId } });
      if (!invoice || invoice.companyId !== companyId) {
        throw new BadRequestException(`Factura no encontrada: ${item.invoiceId}`);
      }
      if (invoice.status === "VOID") {
        throw new BadRequestException(`No se puede aplicar pago a factura anulada: ${invoice.number}`);
      }
      
      const balance = Number(invoice.total) - Number(invoice.amountPaid);
      const applied = Number(item.amountApplied);
      
      if (applied > balance) {
        throw new BadRequestException(`El abono (${applied}) supera el saldo (${balance}) de la factura ${invoice.number}`);
      }

      totalApplied += applied;
      invoicesToUpdate.push({
        id: invoice.id,
        newAmountPaid: Number(invoice.amountPaid) + applied
      });
    }

    // 2. Transacción
    return this.prisma.$transaction(async (tx) => {
      // Crear el recibo de pago
      const payment = await tx.customerPayment.create({
        data: {
          companyId,
          customerId: dto.customerId,
          receiptNumber: dto.receiptNumber,
          paymentDate: new Date(dto.paymentDate),
          amount: totalApplied,
          currency: dto.currency || "VES",
          exchangeRate: dto.exchangeRate || 1,
          paymentMethod: dto.paymentMethod,
          reference: dto.reference,
          notes: dto.notes,
          items: {
            create: dto.items.map((item: any) => ({
              invoiceId: item.invoiceId,
              amountApplied: Number(item.amountApplied)
            }))
          }
        },
        include: {
          items: true
        }
      });

      // Actualizar el amountPaid de cada factura
      for (const inv of invoicesToUpdate) {
        await tx.invoice.update({
          where: { id: inv.id },
          data: { amountPaid: inv.newAmountPaid }
        });
      }

      return payment;
    });
  }
}
