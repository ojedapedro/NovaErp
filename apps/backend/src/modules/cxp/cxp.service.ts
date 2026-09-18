import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";

@Injectable()
export class CxpService {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingInvoices(companyId: string, supplierId?: string) {
    return this.prisma.purchaseInvoice.findMany({
      where: {
        companyId,
        ...(supplierId && { supplierId }),
        status: { not: "VOID" },
      },
      include: {
        supplier: true,
      },
      orderBy: { invoiceDate: "asc" },
    }).then(invoices => invoices.filter(inv => Number(inv.total) - Number(inv.amountPaid) > 0));
  }

  async getPayments(companyId: string) {
    return this.prisma.supplierPayment.findMany({
      where: { companyId },
      include: {
        supplier: true,
        items: { include: { purchaseInvoice: true } },
      },
      orderBy: { paymentDate: "desc" },
    });
  }

  async registerPayment(companyId: string, dto: any) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException("Debe incluir al menos una factura a pagar");
    }

    const invoicesToUpdate: any[] = [];
    let totalApplied = 0;

    for (const item of dto.items) {
      const invoice = await this.prisma.purchaseInvoice.findUnique({ where: { id: item.purchaseInvoiceId } });
      if (!invoice || invoice.companyId !== companyId) {
        throw new BadRequestException(`Factura no encontrada: ${item.purchaseInvoiceId}`);
      }
      if (invoice.status === "VOID") {
        throw new BadRequestException(`No se puede aplicar pago a factura anulada: ${invoice.invoiceNumber}`);
      }
      
      const balance = Number(invoice.total) - Number(invoice.amountPaid);
      const applied = Number(item.amountApplied);
      
      if (applied > balance) {
        throw new BadRequestException(`El abono (${applied}) supera el saldo (${balance}) de la factura ${invoice.invoiceNumber}`);
      }

      totalApplied += applied;
      invoicesToUpdate.push({
        id: invoice.id,
        newAmountPaid: Number(invoice.amountPaid) + applied
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.supplierPayment.create({
        data: {
          companyId,
          supplierId: dto.supplierId,
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
              purchaseInvoiceId: item.purchaseInvoiceId,
              amountApplied: Number(item.amountApplied)
            }))
          }
        },
        include: { items: true }
      });

      for (const inv of invoicesToUpdate) {
        await tx.purchaseInvoice.update({
          where: { id: inv.id },
          data: { amountPaid: inv.newAmountPaid }
        });
      }

      return payment;
    });
  }
}
