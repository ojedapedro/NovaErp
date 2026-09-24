import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class ComprasService {
  constructor(private readonly prisma: PrismaService) {}

  async getSuppliers(companyId: string) {
    return this.prisma.supplier.findMany({
      where: { companyId },
      orderBy: { legalName: 'asc' },
    });
  }

  async createSupplier(companyId: string, dto: any) {
    const existing = await this.prisma.supplier.findUnique({
      where: { companyId_rif: { companyId, rif: dto.rif } },
    });
    if (existing) {
      throw new BadRequestException('El proveedor con RIF ' + dto.rif + ' ya existe');
    }
    return this.prisma.supplier.create({ data: { ...dto, companyId } });
  }

  async updateSupplier(companyId: string, id: string, dto: any) {
    return this.prisma.supplier.update({ where: { id, companyId }, data: dto });
  }

  async getPurchaseInvoices(companyId: string) {
    return this.prisma.purchaseInvoice.findMany({
      where: { companyId },
      include: { supplier: true, items: true },
      orderBy: { invoiceDate: 'desc' },
    });
  }

  async createPurchaseInvoice(companyId: string, dto: any) {
    if (!dto.supplierId) throw new BadRequestException('supplierId es requerido');
    if (!dto.items || !Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException('La factura debe tener al menos un producto (items)');
    }

    let invoiceSubtotal = 0;
    let invoiceTaxAmount = 0;
    let invoiceExempt = 0;

    const invoiceItems = dto.items.map((item: any) => {
      const q    = Number(item.quantity)  || 0;
      const p    = Number(item.unitPrice) || 0;
      const tRate = Number(item.taxRate)  || 0;

      const lineSubtotal = q * p;
      const lineTax      = lineSubtotal * tRate;
      const lineTotal    = lineSubtotal + lineTax;

      invoiceSubtotal   += lineSubtotal;
      invoiceTaxAmount  += lineTax;
      if (tRate === 0) invoiceExempt += lineSubtotal;

      return {
        productId:   item.productId   ?? null,
        productCode: item.productCode ?? null,
        productName: item.productName ?? null,
        description: item.description ?? null,
        quantity:    q,
        unitPrice:   p,
        taxRate:     tRate,
        subtotal:    lineSubtotal,
        taxAmount:   lineTax,
        total:       lineTotal,
      };
    });

    const invoiceTotal = invoiceSubtotal + invoiceTaxAmount;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const itemsToCreate = [];

        // 1. Process all products (upsert/update stock & costs) BEFORE creating invoice
        for (const item of invoiceItems) {
          let product = null;
          
          if (item.productId) {
            product = await tx.product.findUnique({ where: { id: item.productId } });
          } else if (item.productCode) {
            product = await tx.product.findUnique({ where: { companyId_code: { companyId, code: item.productCode } } });
          }

          if (!product && item.productCode && item.productName) {
            // Auto-create new product
            product = await tx.product.create({
              data: {
                companyId,
                code: item.productCode,
                name: item.productName,
                taxType: item.taxRate > 0 ? 'IVA_GENERAL' : 'EXENTO',
                unitPrice: item.unitPrice * 1.3,
                stock: 0,
                lastCost: item.unitPrice,
                averageCost: item.unitPrice
              }
            });
          }

          if (product) {
            const currentStock = Number(product.stock);
            const currentAvgCost = Number(product.averageCost || 0);
            const q = item.quantity;
            const cost = item.unitPrice;

            // Weighted average cost calculation
            const totalValueCurrent = currentStock > 0 ? currentStock * currentAvgCost : 0;
            const totalValuePurchased = q * cost;
            const newStock = currentStock + q;
            const newAvgCost = newStock > 0 ? (totalValueCurrent + totalValuePurchased) / newStock : cost;

            await tx.product.update({
              where: { id: product.id },
              data: {
                stock: newStock,
                lastCost: cost,
                averageCost: newAvgCost,
                name: (item.productName && item.productName !== product.name) ? item.productName : undefined
              }
            });
          }

          itemsToCreate.push({
            productId: product?.id || null,
            description: item.description || product?.name || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            subtotal: item.subtotal,
            taxAmount: item.taxAmount,
            total: item.total
          });
        }

        // 2. Create Invoice
        const invoice = await tx.purchaseInvoice.create({
          data: {
            companyId,
            supplierId:    dto.supplierId,
            invoiceNumber: dto.invoiceNumber,
            controlNumber: dto.controlNumber,
            invoiceDate:   new Date(dto.invoiceDate),
            subtotal:      invoiceSubtotal,
            exemptAmount:  invoiceExempt,
            taxAmount:     invoiceTaxAmount,
            total:         invoiceTotal,
            amountPaid:    0,
            currency:      dto.currency    || 'VES',
            exchangeRate:  dto.exchangeRate || 1,
            notes:         dto.notes       ?? null,
            items: { create: itemsToCreate },
          },
          include: { items: true },
        });

        // 3. Register Kardex movements
        for (const item of itemsToCreate) {
          if (item.productId) {
            await tx.inventoryMovement.create({
              data: {
                companyId,
                productId:       item.productId,
                movementType:    'IN',
                concept:         'COMPRA',
                quantity:        item.quantity,
                unitCost:        item.unitPrice,
                totalCost:       item.subtotal,
                referenceId:     invoice.id,
                referenceNumber: invoice.invoiceNumber,
                notes:           'Compra segun factura ' + invoice.invoiceNumber,
              },
            });
          }
        }

        return invoice;
      });
    } catch (error: any) {
      console.error('Error creating purchase invoice:', error);
      throw new BadRequestException(error.message || 'Error al crear la factura en la base de datos');
    }
  }
}
