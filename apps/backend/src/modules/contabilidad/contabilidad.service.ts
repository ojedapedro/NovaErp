import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class ContabilidadService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------
  // PLAN DE CUENTAS
  // ---------------------------------------------------------------
  async findAllAccounts(companyId: string) {
    return this.prisma.chartOfAccount.findMany({
      where: { companyId, isActive: true },
      orderBy: { code: 'asc' },
      include: { children: { orderBy: { code: 'asc' } } },
    });
  }

  async createAccount(companyId: string, dto: {
    code: string;
    name: string;
    type: string;
    parentId?: string;
    isControl?: boolean;
  }) {
    return this.prisma.chartOfAccount.create({
      data: { ...dto, companyId },
    });
  }

  // ---------------------------------------------------------------
  // PERÍODOS FISCALES
  // ---------------------------------------------------------------
  async findAllPeriods(companyId: string) {
    return this.prisma.fiscalPeriod.findMany({
      where: { companyId },
      orderBy: { startDate: 'desc' },
    });
  }

  async createPeriod(companyId: string, dto: {
    name: string;
    startDate: Date;
    endDate: Date;
  }) {
    return this.prisma.fiscalPeriod.create({
      data: { ...dto, companyId, status: 'OPEN' },
    });
  }

  async closePeriod(companyId: string, periodId: string) {
    const period = await this.prisma.fiscalPeriod.findFirst({
      where: { id: periodId, companyId },
    });
    if (!period) throw new NotFoundException('Período fiscal no encontrado.');
    if (period.status === 'CLOSED') throw new BadRequestException('El período ya está cerrado.');

    return this.prisma.fiscalPeriod.update({
      where: { id: periodId },
      data: { status: 'CLOSED' },
    });
  }

  // ---------------------------------------------------------------
  // ASIENTOS CONTABLES
  // ---------------------------------------------------------------
  async findAllJournalEntries(companyId: string, filters?: { fromDate?: Date; toDate?: Date }) {
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

  async createJournalEntry(companyId: string, dto: {
    entryDate: Date;
    concept: string;
    lines: Array<{ accountId: string; debit: number; credit: number; description?: string }>;
  }) {
    // Validar partida doble: sum(debits) === sum(credits)
    const totalDebit = dto.lines.reduce((acc, l) => acc + (l.debit || 0), 0);
    const totalCredit = dto.lines.reduce((acc, l) => acc + (l.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new BadRequestException(
        `Partida doble inválida: Total Débitos (${totalDebit}) ≠ Total Créditos (${totalCredit}). ` +
        `La diferencia es ${Math.abs(totalDebit - totalCredit).toFixed(2)} Bs.`
      );
    }

    // Obtener siguiente número de asiento para la empresa
    const lastEntry = await this.prisma.journalEntry.findFirst({
      where: { companyId },
      orderBy: { number: 'desc' },
      select: { number: true },
    });
    const nextNumber = lastEntry ? Number(lastEntry.number) + 1 : 1;

    return this.prisma.$transaction(async (tx: any) => {
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

  async postJournalEntry(companyId: string, entryId: string) {
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id: entryId, companyId },
    });
    if (!entry) throw new NotFoundException('Asiento contable no encontrado.');
    if (entry.isPosted) throw new BadRequestException('El asiento ya fue contabilizado.');

    return this.prisma.journalEntry.update({
      where: { id_entryDate: { id: entryId, entryDate: entry.entryDate } },
      data: { isPosted: true },
    });
  }

  // ---------------------------------------------------------------
  // BALANCE DE COMPROBACIÓN
  // ---------------------------------------------------------------
  async getTrialBalance(companyId: string, fromDate: Date, toDate: Date) {
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

    const linesMap = new Map(linesGrouped.map((g: any) => [g.accountId, g]));

    return accounts.map((account: any) => {
      const group: any = linesMap.get(account.id);
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
}
