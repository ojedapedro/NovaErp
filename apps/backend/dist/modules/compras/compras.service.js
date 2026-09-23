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
exports.ComprasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
let ComprasService = class ComprasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSuppliers(companyId) {
        return this.prisma.supplier.findMany({
            where: { companyId },
            orderBy: { legalName: 'asc' },
        });
    }
    async createSupplier(companyId, dto) {
        const existing = await this.prisma.supplier.findUnique({
            where: { companyId_rif: { companyId, rif: dto.rif } },
        });
        if (existing) {
            throw new common_1.BadRequestException(`El proveedor con RIF ${dto.rif} ya existe`);
        }
        return this.prisma.supplier.create({
            data: {
                ...dto,
                companyId,
            },
        });
    }
    async updateSupplier(companyId, id, dto) {
        return this.prisma.supplier.update({
            where: { id, companyId },
            data: dto,
        });
    }
    async getPurchaseInvoices(companyId) {
        return this.prisma.purchaseInvoice.findMany({
            where: { companyId },
            include: { supplier: true, items: true },
            orderBy: { invoiceDate: 'desc' },
        });
    }
    async createPurchaseInvoice(companyId, dto) {
        if (!dto.supplierId)
            throw new common_1.BadRequestException('supplierId is required');
        if (!dto.items || !Array.isArray(dto.items) || dto.items.length === 0) {
            throw new common_1.BadRequestException('La factura debe tener al menos un producto (items)');
        }
        let invoiceSubtotal = 0;
        let invoiceTaxAmount = 0;
        let invoiceExempt = 0;
        const invoiceItems = dto.items.map((item) => {
            const q = Number(item.quantity) || 0;
            const p = Number(item.unitPrice) || 0;
            const tRate = Number(item.taxRate) || 0;
            const lineSubtotal = q * p;
            const lineTax = lineSubtotal * tRate;
            const lineTotal = lineSubtotal + lineTax;
            invoiceSubtotal += lineSubtotal;
            if (tRate === 0)
                invoiceExempt += lineSubtotal;
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
                });
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
                    }
                }
                return invoice;
            });
        }
        catch (error) {
            console.error("Error creating purchase invoice:", error);
            throw new common_1.BadRequestException(error.message || "Error al crear la factura en la base de datos");
        }
    }
};
exports.ComprasService = ComprasService;
exports.ComprasService = ComprasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ComprasService);
//# sourceMappingURL=compras.service.js.map