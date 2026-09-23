import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class FacturacionService {
  constructor(private readonly prisma: PrismaService) {}

  // -- CLIENTES -----------------------------------------------------
  async findAllCustomers(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId, isActive: true },
      orderBy: { legalName: 'asc' },
    });
  }

  async createCustomer(companyId: string, dto: {
    legalName: string;
    rif: string;
    address?: string;
    email?: string;
    phone?: string;
  }) {
    const existing = await this.prisma.customer.findUnique({
      where: { companyId_rif: { companyId, rif: dto.rif } },
    });
    if (existing) throw new BadRequestException(`Ya existe un cliente con RIF ${dto.rif}`);
    return this.prisma.customer.create({ data: { ...dto, companyId } });
  }

  async updateCustomer(companyId: string, id: string, dto: Partial<{
    legalName: string; rif: string; address: string; email: string; phone: string;
  }>) {
    const customer = await this.prisma.customer.findFirst({ where: { id, companyId } });
    if (!customer) throw new NotFoundException('Cliente no encontrado');
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  // -- PRODUCTOS ----------------------------------------------------
  async findAllProducts(companyId: string) {
    return this.prisma.product.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createProduct(companyId: string, dto: {
    code: string;
    name: string;
    description?: string;
    unitPrice: number;
    unitMeasure?: string;
    taxType?: string;
  }) {
    const existing = await this.prisma.product.findUnique({
      where: { companyId_code: { companyId, code: dto.code } },
    });
    if (existing) throw new BadRequestException(`Ya existe un producto con código ${dto.code}`);
    return this.prisma.product.create({ data: { ...dto, companyId } });
  }

  async updateProduct(companyId: string, id: string, dto: any) {
    const product = await this.prisma.product.findFirst({ where: { id, companyId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  // -- FACTURAS -----------------------------------------------------
  async findAllInvoices(companyId: string, params?: { status?: string; customerId?: string }) {
    return this.prisma.invoice.findMany({
      where: {
        companyId,
        ...(params?.status && { status: params.status }),
        ...(params?.customerId && { customerId: params.customerId }),
      },
      include: {
        customer: { select: { legalName: true, rif: true } },
        items: { include: { product: { select: { name: true, code: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInvoice(companyId: string, dto: {
    customerId: string;
    invoiceDate: string;
    currency?: string;
    exchangeRate?: number;
    applyIgtf?: boolean;
    notes?: string;
    items: Array<{
      productId: string;
      description?: string;
      quantity: number;
      unitPrice: number;
    }>;
  }) {
    // Get tax rates
    const ivaRate = await this.prisma.taxRate.findFirst({
      where: { taxType: 'IVA_GENERAL' },
      orderBy: { validFrom: 'desc' },
    });
    const igtfRate = await this.prisma.taxRate.findFirst({
      where: { taxType: 'IGTF_DIVISAS' },
      orderBy: { validFrom: 'desc' },
    });

    const ivaPct = Number(ivaRate?.rate ?? 16);
    const igtfPct = dto.applyIgtf ? Number(igtfRate?.rate ?? 3) : 0;

    // Calculate items
    let subtotal = 0;
    let taxAmount = 0;
    const itemsData: any[] = [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findFirst({ where: { id: item.productId, companyId } });
      if (!product) throw new NotFoundException(`Producto ${item.productId} no encontrado`);

      const itemSubtotal = Number(item.quantity) * Number(item.unitPrice);
      const itemTax = itemSubtotal * (ivaPct / 100);
      const itemTotal = itemSubtotal + itemTax;

      subtotal += itemSubtotal;
      taxAmount += itemTax;

      itemsData.push({
        productId: item.productId,
        description: item.description || product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: ivaPct,
        subtotal: itemSubtotal,
        taxAmount: itemTax,
        total: itemTotal,
      });
    }

    const igtfAmount = (subtotal + taxAmount) * (igtfPct / 100);
    const total = subtotal + taxAmount + igtfAmount;

    // Get next invoice number
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { companyId },
      orderBy: { number: 'desc' },
      select: { number: true },
    });
    const nextNumber = lastInvoice ? Number(lastInvoice.number) + 1 : 1;    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          companyId,
          customerId: dto.customerId,
          number: nextNumber,
          invoiceDate: new Date(dto.invoiceDate),
          status: 'ISSUED',
          subtotal,
          taxAmount,
          igtfAmount,
          total,
          currency: dto.currency || 'USD',
          exchangeRate: dto.exchangeRate || 1,
          notes: dto.notes,
          items: { create: itemsData },
        },
        include: {
          customer: true,
          items: { include: { product: { select: { name: true, code: true } } } },
        },
      });

      // Actualizar inventario y Kardex (Salida por Venta)
      for (const item of itemsData) {
        if (item.productId) {
          // Obtener el costo unitario para la salida (idealmente costo promedio, usamos unitPrice base)
          const p = await tx.product.findUnique({ where: { id: item.productId } });
          const cost = p ? p.unitPrice : item.unitPrice;

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity }
            }
          });

          await tx.inventoryMovement.create({
            data: {
              companyId,
              productId: item.productId,
              movementType: 'OUT',
              concept: 'VENTA',
              quantity: item.quantity,
              unitCost: cost,
              totalCost: Number(item.quantity) * Number(cost),
              referenceId: invoice.id,
              referenceNumber: invoice.number.toString(),
              notes: \Venta según factura \\
            }
          });
        }
      }

      return invoice;
    });
  }

  async voidInvoice(companyId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id, companyId } });
    if (!invoice) throw new NotFoundException('Factura no encontrada');
    if (invoice.status === 'VOID') throw new BadRequestException('La factura ya fue anulada');
    return this.prisma.invoice.update({ where: { id }, data: { status: 'VOID' } });
  }
}
