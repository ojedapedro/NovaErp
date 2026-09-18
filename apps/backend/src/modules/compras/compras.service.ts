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
      include: { supplier: true },
      orderBy: { invoiceDate: 'desc' },
    });
  }

  async createPurchaseInvoice(companyId: string, dto: any) {
    // Basic validation
    if (!dto.supplierId) throw new BadRequestException('supplierId is required');

    return this.prisma.purchaseInvoice.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }
}
