import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class InventarioService {
  constructor(private readonly prisma: PrismaService) {}

  async getKardex(companyId: string, productId: string) {
    return this.prisma.inventoryMovement.findMany({
      where: { companyId, productId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, code: true, unitMeasure: true } }
      }
    });
  }

  async getInventarioValorizado(companyId: string) {
    const products = await this.prisma.product.findMany({
      where: { companyId, isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        stock: true,
        unitMeasure: true,
        unitPrice: true,
        averageCost: true,
        lastCost: true
      }
    });

    return products.map(p => {
      const avgCost = Number(p.averageCost || 0);
      return {
        ...p,
        costoPromedio: avgCost,
        valorTotal: Number(p.stock) * avgCost
      };
    });
  }

  async registrarAjuste(companyId: string, dto: any) {
    if (!dto.productId || dto.adjustedStock === undefined || dto.adjustedStock === null) {
      throw new BadRequestException('Faltan datos para el ajuste (productId, adjustedStock)');
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: dto.productId }
      });

      if (!product || product.companyId !== companyId) {
        throw new BadRequestException('Producto no encontrado');
      }

      const currentStock = Number(product.stock);
      const adjustedStock = Number(dto.adjustedStock);
      
      if (currentStock === adjustedStock) {
        throw new BadRequestException('El stock ajustado es igual al actual');
      }

      const diff = adjustedStock - currentStock;
      const type = diff > 0 ? 'IN' : 'OUT';
      const absDiff = Math.abs(diff);

      const avgCost = Number(product.averageCost || 0);
      const adjTotalCost = absDiff * avgCost;

      const movement = await tx.inventoryMovement.create({
        data: {
          companyId,
          productId: product.id,
          movementType: type,
          concept: 'TOMA_FISICA',
          quantity: absDiff,
          unitCost: avgCost,
          totalCost: adjTotalCost,
          notes: dto.notes || `Ajuste físico de ${currentStock} a ${adjustedStock}`,
        }
      });

      await tx.product.update({
        where: { id: product.id },
        data: { stock: adjustedStock }
      });

      return movement;
    });
  }
}
