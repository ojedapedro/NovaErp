import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class ComprasService {
  constructor(private readonly prisma: PrismaService) {}

  // ================= PROVEEDORES =================
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
      throw new BadRequestException(`El proveedor con RIF ${dto.rif} ya existe`);
    }

    return this.prisma.supplier.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async updateSupplier(companyId: string, id: string, dto: any) {
    return this.prisma.supplier.update({
      where: { id, companyId },
      data: dto,
    });
  }

  // ================= FACTURAS DE COMPRA =================
  async getPurchaseInvoices(companyId: string) {
    return this.prisma.purchaseInvoice.findMany({
      where: { companyId },
      include: { supplier: true, items: true },
      orderBy: { invoiceDate: 'desc' },
    });
  }

  async createPurchaseInvoice(companyId: string, dto: any) {
    if (!dto.supplierId) throw new BadRequestException('supplierId is required');
    if (!dto.items || !Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException('La factura debe tener al menos un producto (items)');
    }

    let invoiceSubtotal = 0;
    let invoiceTaxAmount = 0;
    let invoiceExempt = 0;
    
    // Preparar líneas y sumar totales
    const invoiceItems = dto.items.map((item: any) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.unitPrice) || 0;
      const tRate = Number(item.taxRate) || 0;
      const lineSubtotal = q * p;
      const lineTax = lineSubtotal * tRate;
      const lineTotal = lineSubtotal + lineTax;

      invoiceSubtotal += lineSubtotal;
      if (tRate === 0) invoiceExempt += lineSubtotal;
      invoiceTaxAmount += lineTax;

      return {
        productId: item.productId,
        description: item.description,
        quantity: q,
        unitPrice: p,
        taxRate: tRate,
        subtotal: lineSubtotal,
        taxAmount: lineTax,
        total: lineTotal
      };
    });

    const invoiceTotal = invoiceSubtotal + invoiceTaxAmount;

    try {
      // Transacción: Crear factura, crear items, sumar inventario
      return await this.prisma.$transaction(async (tx) => {
        const invoice = await tx.purchaseInvoice.create({
          data: {
            companyId,
            supplierId: dto.supplierId,
            invoiceNumber: dto.invoiceNumber,
            controlNumber: dto.controlNumber,
            invoiceDate: new Date(dto.invoiceDate),
            subtotal: invoiceSubtotal,
            exemptAmount: invoiceExempt,
            taxAmount: invoiceTaxAmount,
            total: invoiceTotal,
            amountPaid: 0,
            currency: dto.currency || 'VES',
            exchangeRate: dto.exchangeRate || 1,
            notes: dto.notes,
            items: {
              create: invoiceItems
            }
          },
          include: { items: true }
        });        // Actualizar inventario y Kardex
        for (const item of invoiceItems) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity
                }
              }
            });

            await tx.inventoryMovement.create({
              data: {
                companyId,
                productId: item.productId,
                movementType: 'IN',
                concept: 'COMPRA',
                quantity: item.quantity,
                unitCost: item.unitPrice,
                totalCost: item.subtotal,
                referenceId: invoice.id,
                referenceNumber: invoice.invoiceNumber,
                notes: \Compra segun factura \\
              }
            });
          }
        }

        return invoice;
      });
    } catch (error: any) {
      console.error("Error creating purchase invoice:", error);
      throw new BadRequestException(error.message || "Error al crear la factura en la base de datos");
    }
  }
}
