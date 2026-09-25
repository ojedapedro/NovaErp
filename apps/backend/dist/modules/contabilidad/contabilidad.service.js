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
exports.ContabilidadService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
let ContabilidadService = class ContabilidadService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllAccounts(companyId) {
        return this.prisma.chartOfAccount.findMany({
            where: { companyId, isActive: true },
            orderBy: { code: 'asc' },
            include: { children: { orderBy: { code: 'asc' } } },
        });
    }
    async createAccount(companyId, dto) {
        return this.prisma.chartOfAccount.create({
            data: { ...dto, companyId },
        });
    }
    async findAllPeriods(companyId) {
        return this.prisma.fiscalPeriod.findMany({
            where: { companyId },
            orderBy: { startDate: 'desc' },
        });
    }
    async createPeriod(companyId, dto) {
        return this.prisma.fiscalPeriod.create({
            data: { ...dto, companyId, status: 'OPEN' },
        });
    }
    async closePeriod(companyId, periodId) {
        const period = await this.prisma.fiscalPeriod.findFirst({
            where: { id: periodId, companyId },
        });
        if (!period)
            throw new common_1.NotFoundException('Período fiscal no encontrado.');
        if (period.status === 'CLOSED')
            throw new common_1.BadRequestException('El período ya está cerrado.');
        return this.prisma.fiscalPeriod.update({
            where: { id: periodId },
            data: { status: 'CLOSED' },
        });
    }
    async findAllJournalEntries(companyId, filters) {
        return this.prisma.journalEntry.findMany({
            where: {
                companyId,
                ...(filters?.fromDate && { entryDate: { gte: filters.fromDate } }),
                ...(filters?.toDate && { entryDate: { lte: filters.toDate } }),
            },
            include: {
                lines: {
                    include: { account: { select: { code: true, name: true } } },
                },
            },
            orderBy: { entryDate: 'desc' },
        });
    }
    async createJournalEntry(companyId, dto) {
        const totalDebit = dto.lines.reduce((acc, l) => acc + (l.debit || 0), 0);
        const totalCredit = dto.lines.reduce((acc, l) => acc + (l.credit || 0), 0);
        if (Math.abs(totalDebit - totalCredit) > 0.001) {
            throw new common_1.BadRequestException(`Partida doble inválida: Total Débitos (${totalDebit}) ≠ Total Créditos (${totalCredit}). ` +
                `La diferencia es ${Math.abs(totalDebit - totalCredit).toFixed(2)} Bs.`);
        }
        const lastEntry = await this.prisma.journalEntry.findFirst({
            where: { companyId },
            orderBy: { number: 'desc' },
            select: { number: true },
        });
        const nextNumber = lastEntry ? Number(lastEntry.number) + 1 : 1;
        return this.prisma.$transaction(async (tx) => {
            const entry = await tx.journalEntry.create({
                data: {
                    companyId,
                    entryDate: dto.entryDate,
                    number: nextNumber,
                    concept: dto.concept,
                    isPosted: false,
                    lines: {
                        create: dto.lines.map((line) => ({
                            accountId: line.accountId,
                            debit: line.debit,
                            credit: line.credit,
                            description: line.description,
                        })),
                    },
                },
                include: { lines: true },
            });
            return entry;
        });
    }
    async postJournalEntry(companyId, entryId) {
        const entry = await this.prisma.journalEntry.findFirst({
            where: { id: entryId, companyId },
        });
        if (!entry)
            throw new common_1.NotFoundException('Asiento contable no encontrado.');
        if (entry.isPosted)
            throw new common_1.BadRequestException('El asiento ya fue contabilizado.');
        return this.prisma.journalEntry.update({
            where: { id_entryDate: { id: entryId, entryDate: entry.entryDate } },
            data: { isPosted: true },
        });
    }
    async getTrialBalance(companyId, fromDate, toDate) {
        const accounts = await this.prisma.chartOfAccount.findMany({
            where: { companyId, isActive: true, isControl: false },
            orderBy: { code: 'asc' },
        });
        const linesGrouped = await this.prisma.journalEntryLine.groupBy({
            by: ['accountId'],
            _sum: {
                debit: true,
                credit: true,
            },
            where: {
                journalEntry: {
                    companyId,
                    isPosted: true,
                    entryDate: { gte: fromDate, lte: toDate },
                },
            },
        });
        const linesMap = new Map(linesGrouped.map((g) => [g.accountId, g]));
        return accounts.map((account) => {
            const group = linesMap.get(account.id);
            const totalDebit = Number(group?._sum?.debit || 0);
            const totalCredit = Number(group?._sum?.credit || 0);
            return {
                accountCode: account.code,
                accountName: account.name,
                accountType: account.type,
                totalDebit,
                totalCredit,
                balance: totalDebit - totalCredit,
            };
        });
    }
};
exports.ContabilidadService = ContabilidadService;
exports.ContabilidadService = ContabilidadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContabilidadService);
//# sourceMappingURL=contabilidad.service.js.map