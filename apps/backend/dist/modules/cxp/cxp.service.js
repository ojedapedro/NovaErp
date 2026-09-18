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
exports.CxpService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
let CxpService = class CxpService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPendingInvoices(companyId, supplierId) {
        return this.prisma.purchaseInvoice.findMany({
            where: {
                companyId,
                ...(supplierId && { supplierId }),
                status: { not: "VOID" },
            },
            include: {
                supplier: true,
            },
            orderBy: { invoiceDate: "asc" },
        }).then(invoices => invoices.filter(inv => Number(inv.total) - Number(inv.amountPaid) > 0));
    }
    async getPayments(companyId) {
        return this.prisma.supplierPayment.findMany({
            where: { companyId },
            include: {
                supplier: true,
                items: { include: { purchaseInvoice: true } },
            },
            orderBy: { paymentDate: "desc" },
        });
    }
    async registerPayment(companyId, dto) {
        if (!dto.items || dto.items.length === 0) {
            throw new common_1.BadRequestException("Debe incluir al menos una factura a pagar");
        }
        const invoicesToUpdate = [];
        let totalApplied = 0;
        for (const item of dto.items) {
            const invoice = await this.prisma.purchaseInvoice.findUnique({ where: { id: item.purchaseInvoiceId } });
            if (!invoice || invoice.companyId !== companyId) {
                throw new common_1.BadRequestException(`Factura no encontrada: ${item.purchaseInvoiceId}`);
            }
            if (invoice.status === "VOID") {
                throw new common_1.BadRequestException(`No se puede aplicar pago a factura anulada: ${invoice.invoiceNumber}`);
            }
            const balance = Number(invoice.total) - Number(invoice.amountPaid);
            const applied = Number(item.amountApplied);
            if (applied > balance) {
                throw new common_1.BadRequestException(`El abono (${applied}) supera el saldo (${balance}) de la factura ${invoice.invoiceNumber}`);
            }
            totalApplied += applied;
            invoicesToUpdate.push({
                id: invoice.id,
                newAmountPaid: Number(invoice.amountPaid) + applied
            });
        }
        return this.prisma.$transaction(async (tx) => {
            const payment = await tx.supplierPayment.create({
                data: {
                    companyId,
                    supplierId: dto.supplierId,
                    receiptNumber: dto.receiptNumber,
                    paymentDate: new Date(dto.paymentDate),
                    amount: totalApplied,
                    currency: dto.currency || "VES",
                    exchangeRate: dto.exchangeRate || 1,
                    paymentMethod: dto.paymentMethod,
                    reference: dto.reference,
                    notes: dto.notes,
                    items: {
                        create: dto.items.map((item) => ({
                            purchaseInvoiceId: item.purchaseInvoiceId,
                            amountApplied: Number(item.amountApplied)
                        }))
                    }
                },
                include: { items: true }
            });
            for (const inv of invoicesToUpdate) {
                await tx.purchaseInvoice.update({
                    where: { id: inv.id },
                    data: { amountPaid: inv.newAmountPaid }
                });
            }
            return payment;
        });
    }
};
exports.CxpService = CxpService;
exports.CxpService = CxpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CxpService);
//# sourceMappingURL=cxp.service.js.map