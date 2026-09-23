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
        unitPrice: true 
      }
    });

    // Calculate average cost from IN movements
    const inMovements = await this.prisma.inventoryMovement.groupBy({
      by: ['productId'],
      where: { companyId, movementType: 'IN' },
      _sum: { quantity: true, totalCost: true }
    });

    const costMap = new Map();
    for (const mov of inMovements) {
      const totalQty = Number(mov._sum.quantity || 0);
      const totalCost = Number(mov._sum.totalCost || 0);
      const avgCost = totalQty > 0 ? totalCost / totalQty : 0;
      costMap.set(mov.productId, avgCost);
    }

    return products.map(p => {
      const avgCost = costMap.get(p.id) || Number(p.unitPrice);
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

      // Get avg cost for the adjustment
      const inMovements = await tx.inventoryMovement.aggregate({
        where: { companyId, productId: product.id, movementType: 'IN' },
        _sum: { quantity: true, totalCost: true }
      });
      const totalQty = Number(inMovements._sum.quantity || 0);
      const totalCost = Number(inMovements._sum.totalCost || 0);
      const avgCost = totalQty > 0 ? totalCost / totalQty : Number(product.unitPrice);

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
          notes: dto.notes || ('Ajuste fisico de ' + currentStock + ' a ' + adjustedStock),
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
