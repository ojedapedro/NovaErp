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
            include: { supplier: true },
            orderBy: { invoiceDate: 'desc' },
        });
    }
    async createPurchaseInvoice(companyId, dto) {
        if (!dto.supplierId)
            throw new common_1.BadRequestException('supplierId is required');
        return this.prisma.purchaseInvoice.create({
            data: {
                ...dto,
                companyId,
            },
        });
    }
};
exports.ComprasService = ComprasService;
exports.ComprasService = ComprasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ComprasService);
//# sourceMappingURL=compras.service.js.map