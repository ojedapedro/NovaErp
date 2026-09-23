import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class InventarioService {
  constructor(private readonly prisma: PrismaService) {}

  // Obtener Kardex de un producto específico
  async getKardex(companyId: string, productId: string) {
    return this.prisma.inventoryMovement.findMany({
      where: { companyId, productId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, code: true, unitMeasure: true } }
      }
    });
  }

  // Obtener Inventario Valorizado (Stock x Costo)
  async getInventarioValorizado(companyId: string) {
    const products = await this.prisma.product.findMany({
      where: { companyId, isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        stock: true,
        unitMeasure: true,
        // Calculate average cost or use unitPrice as a fallback for valuation
        unitPrice: true 
      }
    });

    return products.map(p => ({
      ...p,
      valorTotal: Number(p.stock) * Number(p.unitPrice) // basic valuation using base price
    }));
  }

  // Registrar toma física / ajuste
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
      const totalCost = absDiff * Number(product.unitPrice);

      // Registrar el movimiento
      const movement = await tx.inventoryMovement.create({
        data: {
          companyId,
          productId: product.id,
          movementType: type,
          concept: 'TOMA_FISICA',
          quantity: absDiff,
          unitCost: product.unitPrice,
          totalCost: totalCost,
          notes: dto.notes || `Ajuste físico de ${currentStock} a ${adjustedStock}`,
        }
      });

      // Actualizar el stock
      await tx.product.update({
        where: { id: product.id },
        data: { stock: adjustedStock }
      });

      return movement;
    });
  }
}
