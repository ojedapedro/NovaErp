"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventarioService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
let InventarioService = class InventarioService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getKardex(companyId, productId) {
        return this.prisma.inventoryMovement.findMany({
            where: { companyId, productId },
            orderBy: { createdAt: 'desc' },
            include: {
                product: { select: { name: true, code: true, unitMeasure: true } }
            }
        });
    }
    async getInventarioValorizado(companyId) {
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
    async registrarAjuste(companyId, dto) {
        if (!dto.productId || dto.adjustedStock === undefined || dto.adjustedStock === null) {
            throw new common_1.BadRequestException('Faltan datos para el ajuste (productId, adjustedStock)');
        }
        return this.prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({
                where: { id: dto.productId }
            });
            if (!product || product.companyId !== companyId) {
                throw new common_1.BadRequestException('Producto no encontrado');
            }
            const currentStock = Number(product.stock);
            const adjustedStock = Number(dto.adjustedStock);
            if (currentStock === adjustedStock) {
                throw new common_1.BadRequestException('El stock ajustado es igual al actual');
            }
            const diff = adjustedStock - currentStock;
            const type = diff > 0 ? 'IN' : 'OUT';
            const absDiff = Math.abs(diff);
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
};
exports.InventarioService = InventarioService;
exports.InventarioService = InventarioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventarioService);
//# sourceMappingURL=inventario.service.js.map