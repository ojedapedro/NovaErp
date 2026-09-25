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
exports.RetencionesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
const journal_automation_service_1 = require("../../core/accounting/journal-automation.service");
let RetencionesService = class RetencionesService {
    prisma;
    journalAutomation;
    constructor(prisma, journalAutomation) {
        this.prisma = prisma;
        this.journalAutomation = journalAutomation;
    }
    async getIvaWithholdings(companyId) {
        return this.prisma.ivaWithholding.findMany({
            where: { companyId },
            include: { purchaseInvoice: { include: { supplier: true } } },
            orderBy: { withholdingDate: "desc" },
        });
    }
    async createIvaWithholding(companyId, dto) {
        const invoice = await this.prisma.purchaseInvoice.findUnique({
            where: { id: dto.purchaseInvoiceId },
            include: { supplier: true },
        });
        if (!invoice)
            throw new common_1.BadRequestException("Factura no encontrada");
        if (invoice.companyId !== companyId)
            throw new common_1.BadRequestException("Factura no pertenece a esta empresa");
        const ivaAmount = Number(invoice.taxAmount);
        const pct = Number(dto.withholdingPct);
        const withheldAmount = (ivaAmount * pct) / 100;
        return this.prisma.$transaction(async (tx) => {
            const withholding = await tx.ivaWithholding.create({
                data: {
                    companyId,
                    purchaseInvoiceId: invoice.id,
                    voucherNumber: dto.voucherNumber,
                    withholdingDate: new Date(dto.withholdingDate),
                    withholdingPct: pct,
                    baseAmount: invoice.subtotal,
                    ivaAmount: invoice.taxAmount,
                    withheldAmount: withheldAmount,
                },
            });
            await tx.purchaseInvoice.update({
                where: { id: invoice.id },
                data: {
                    ivaWithheldAmount: withheldAmount,
                    ivaWithholdingNumber: dto.voucherNumber,
                    amountPaid: Number(invoice.amountPaid) + withheldAmount
                },
            });
            await this.journalAutomation.postIvaWithholdingEntry(tx, companyId, withholding, invoice);
            return withholding;
        });
    }
    async exportarIvaTxt(companyId, year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        const withholdings = await this.prisma.ivaWithholding.findMany({
            where: { companyId, withholdingDate: { gte: startDate, lte: endDate } },
            include: { purchaseInvoice: { include: { supplier: true } } },
            orderBy: { withholdingDate: "asc" },
        });
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        const rifEmpresa = company?.rif?.replace(/-/g, "") || "J123456789";
        const periodo = year + String(month).padStart(2, "0");
        let txtContent = "";
        for (const w of withholdings) {
            const inv = w.purchaseInvoice;
            const campos = [
                rifEmpresa,
                periodo,
                w.withholdingDate.toISOString().split("T")[0].replace(/-/g, "-"),
                "C",
                "01",
                inv.supplier.rif.replace(/-/g, ""),
                inv.invoiceNumber,
                inv.controlNumber,
                Number(inv.total).toFixed(2),
                Number(w.baseAmount).toFixed(2),
                Number(w.withheldAmount).toFixed(2),
                0,
                w.voucherNumber,
                Number(w.ivaAmount).toFixed(2),
                Number(inv.exemptAmount).toFixed(2),
                16,
            ];
            txtContent += campos.join("\t") + "\n";
        }
        return txtContent;
    }
    async getIslrConcepts(companyId) {
        return this.prisma.islrConcept.findMany({ where: { companyId }, orderBy: { code: 'asc' } });
    }
    async seedIslrConcepts(companyId) {
        const conceptos = [
            { code: "027", description: "Honorarios Profesionales Residentes", rateJuridica: 5.0, rateNatural: 3.0, sustraendoUt: 83.3334 },
            { code: "053", description: "Fletes y Transporte", rateJuridica: 3.0, rateNatural: 3.0, sustraendoUt: 0 },
            { code: "054", description: "Servicios Publicidad y Radio", rateJuridica: 5.0, rateNatural: 3.0, sustraendoUt: 0 },
        ];
        for (const c of conceptos) {
            await this.prisma.islrConcept.upsert({
                where: { companyId_code: { companyId, code: c.code } },
                update: {},
                create: { ...c, companyId },
            });
        }
        return this.getIslrConcepts(companyId);
    }
    async getIslrWithholdings(companyId) {
        return this.prisma.islrWithholding.findMany({
            where: { companyId },
            include: { supplier: true, islrConcept: true },
            orderBy: { withholdingDate: "desc" },
        });
    }
    async createIslrWithholding(companyId, dto) {
        const concept = await this.prisma.islrConcept.findUnique({ where: { id: dto.islrConceptId } });
        if (!concept)
            throw new common_1.BadRequestException("Concepto ISLR no encontrado");
        const rate = dto.personType === "NATURAL" ? Number(concept.rateNatural) : Number(concept.rateJuridica);
        let withheldAmount = (Number(dto.paymentAmount) * rate) / 100;
        const sustraendoBs = dto.personType === "NATURAL" ? Number(dto.sustraendoBs) : 0;
        withheldAmount = Math.max(0, withheldAmount - sustraendoBs);
        return this.prisma.islrWithholding.create({
            data: {
                companyId,
                supplierId: dto.supplierId,
                islrConceptId: concept.id,
                purchaseInvoiceId: dto.purchaseInvoiceId,
                voucherNumber: dto.voucherNumber,
                withholdingDate: new Date(dto.withholdingDate),
                personType: dto.personType,
                paymentAmount: Number(dto.paymentAmount),
                withholdingRate: rate,
                sustraendoBs: sustraendoBs,
                withheldAmount: withheldAmount,
            },
        });
    }
};
exports.RetencionesService = RetencionesService;
exports.RetencionesService = RetencionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        journal_automation_service_1.JournalAutomationService])
], RetencionesService);
//# sourceMappingURL=retenciones.service.js.map