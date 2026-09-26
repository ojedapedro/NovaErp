import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { JournalAutomationService } from '../../core/accounting/journal-automation.service';

@Injectable()
export class FacturacionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly journalAutomation: JournalAutomationService
  ) {}

  async findAllCustomers(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId, isActive: true },
      orderBy: { legalName: 'asc' },
    });
  }

  async createCustomer(companyId: string, dto: { legalName: string; rif: string; address?: string; email?: string; phone?: string; }) {
    const existing = await this.prisma.customer.findUnique({ where: { companyId_rif: { companyId, rif: dto.rif } } });
    if (existing) throw new BadRequestException('Ya existe un cliente con RIF ' + dto.rif);
    return this.prisma.customer.create({ data: { ...dto, companyId } });
  }

  async updateCustomer(companyId: string, id: string, dto: any) {
    const customer = await this.prisma.customer.findFirst({ where: { id, companyId } });
    if (!customer) throw new NotFoundException('Cliente no encontrado');
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async findAllProducts(companyId: string) {
    return this.prisma.product.findMany({ where: { companyId, isActive: true }, orderBy: { name: 'asc' } });
  }

  async createProduct(companyId: string, dto: { code?: string; barcode?: string; name: string; description?: string; unitPrice: number; unitMeasure?: string; taxType?: string; }) {
    let code = dto.code?.trim();
    if (!code) {
      const count = await this.prisma.product.count({ where: { companyId } });
      code = `PRD-${(count + 1).toString().padStart(5, '0')}`;
      let exists = await this.prisma.product.findUnique({ where: { companyId_code: { companyId, code } } });
      let increment = 1;
      while (exists) {
        code = `PRD-${(count + 1 + increment).toString().padStart(5, '0')}`;
        exists = await this.prisma.product.findUnique({ where: { companyId_code: { companyId, code } } });
        increment++;
      }
    } else {
      const existing = await this.prisma.product.findUnique({ where: { companyId_code: { companyId, code } } });
      if (existing) throw new BadRequestException('Ya existe un producto con el codigo interno ' + code);
    }
    return this.prisma.product.create({ data: { ...dto, code, companyId } });
  }

  async updateProduct(companyId: string, id: string, dto: any) {
    const product = await this.prisma.product.findFirst({ where: { id, companyId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async findAllInvoices(companyId: string, params?: { status?: string; customerId?: string }) {
    return this.prisma.invoice.findMany({
      where: { companyId, ...(params?.status && { status: params.status }), ...(params?.customerId && { customerId: params.customerId }) },
      include: { customer: { select: { legalName: true, rif: true } }, items: { include: { product: { select: { name: true, code: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInvoice(companyId: string, dto: { customerId: string; invoiceDate: string; currency?: string; exchangeRate?: number; applyIgtf?: boolean; notes?: string; items: Array<{ productId: string; description?: string; quantity: number; unitPrice: number; }>; }) {
    const [ivaRate, igtfRate] = await Promise.all([
      this.prisma.taxRate.findFirst({ where: { taxType: 'IVA_GENERAL' }, orderBy: { validFrom: 'desc' } }),
      this.prisma.taxRate.findFirst({ where: { taxType: 'IGTF_DIVISAS' }, orderBy: { validFrom: 'desc' } }),
    ]);
    const ivaPct = Number(ivaRate?.rate ?? 16);
    const igtfPct = dto.applyIgtf ? Number(igtfRate?.rate ?? 3) : 0;
    let subtotal = 0;
    let taxAmount = 0;
    const itemsData: any[] = [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findFirst({ where: { id: item.productId, companyId } });
      if (!product) throw new NotFoundException('Producto ' + item.productId + ' no encontrado');
      const availableStock = Number(product.stock);
      const qty = Number(item.quantity);
      if (qty > availableStock) {
        throw new BadRequestException('Stock insuficiente para ' + product.name + ': disponible ' + availableStock + ', solicitado ' + qty);
      }
      const lineSub = qty * Number(item.unitPrice);
      const lineTax = lineSub * (ivaPct / 100);
      subtotal += lineSub;
      taxAmount += lineTax;
      itemsData.push({ productId: item.productId, description: item.description || product.name, quantity: qty, unitPrice: Number(item.unitPrice), taxRate: ivaPct, subtotal: lineSub, taxAmount: lineTax, total: lineSub + lineTax, _cost: Number(product.unitPrice) });
    }

    const igtfAmount = (subtotal + taxAmount) * (igtfPct / 100);
    const total = subtotal + taxAmount + igtfAmount;

    return this.prisma.$transaction(async (tx) => {
      const lastInv = await tx.invoice.findFirst({ where: { companyId }, orderBy: { number: 'desc' }, select: { number: true } });
      const nextNum = lastInv ? Number(lastInv.number) + 1 : 1;
      const cleanItems = itemsData.map(({ _cost, ...rest }) => rest);
      const invoice = await tx.invoice.create({
        data: { companyId, customerId: dto.customerId, number: nextNum, invoiceDate: new Date(dto.invoiceDate), status: 'ISSUED', subtotal, taxAmount, igtfAmount, total, currency: dto.currency || 'USD', exchangeRate: dto.exchangeRate || 1, notes: dto.notes ?? null, items: { create: cleanItems } },
        include: { customer: true, items: { include: { product: { select: { name: true, code: true } } } } },
      });
      for (const item of itemsData) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
        await tx.inventoryMovement.create({ data: { companyId, productId: item.productId, movementType: 'OUT', concept: 'VENTA', quantity: item.quantity, unitCost: item._cost, totalCost: item.quantity * item._cost, referenceId: invoice.id, referenceNumber: String(invoice.number), notes: 'Venta factura ' + String(invoice.number) } });
      }

      await this.journalAutomation.postInvoiceEntry(tx, companyId, {
        invoiceNumber: String(invoice.number),
        total: invoice.total,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        issueDate: invoice.invoiceDate
      }, itemsData);

      return invoice;
    });
  }

  async voidInvoice(companyId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id, companyId }, include: { items: true } });
    if (!invoice) throw new NotFoundException('Factura no encontrada');
    if (invoice.status === 'VOID') throw new BadRequestException('La factura ya fue anulada');
    return this.prisma.$transaction(async (tx) => {
      await tx.invoice.update({ where: { id, companyId }, data: { status: 'VOID' } });
      for (const item of invoice.items) {
        if (!item.productId) continue;
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        const cost = product ? Number(product.unitPrice) : 0;
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        await tx.inventoryMovement.create({ data: { companyId, productId: item.productId, movementType: 'IN', concept: 'ANULACION_VENTA', quantity: item.quantity, unitCost: cost, totalCost: Number(item.quantity) * cost, referenceId: invoice.id, referenceNumber: String(invoice.number), notes: 'Anulacion venta factura ' + String(invoice.number) } });
      }

      // Reversion (we pass negative amounts to reverse the entry, or rather swap debit and credit by passing negative values to postInvoiceEntry, or custom code)
      // Actually, since we don't have voidInvoiceEntry, I'll pass a negated invoice to postInvoiceEntry
      await this.journalAutomation.postInvoiceEntry(tx, companyId, {
        invoiceNumber: `${invoice.number} (ANULADA)`,
        total: -Number(invoice.total),
        subtotal: -Number(invoice.subtotal),
        taxAmount: -Number(invoice.taxAmount),
        issueDate: new Date()
      }, invoice.items);

      return { message: 'Factura ' + String(invoice.number) + ' anulada. Stock revertido.' };
    });
  }
}
