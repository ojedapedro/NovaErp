import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class FiscalParamService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene el valor de la Unidad Tributaria vigente en una fecha dada.
   * Lee siempre de la BD, nunca usa valores constantes en código.
   */
  async getUnitTaxValue(date: Date): Promise<number> {
    const ut = await this.prisma.taxUnitHistory.findFirst({
      where: {
        validFrom: { lte: date },
        OR: [{ validTo: null }, { validTo: { gte: date } }],
      },
      orderBy: { validFrom: 'desc' },
    });
    if (!ut) {
      throw new Error(`No se encontró valor de Unidad Tributaria para la fecha ${date.toISOString()}`);
    }
    return Number(ut.value);
  }

  /**
   * Obtiene la tasa de un impuesto (IVA, IGTF, etc.) vigente en una fecha dada.
   * taxType: IVA_GENERAL | IVA_REDUCIDO | IVA_ADICIONAL | IGTF_DIVISAS | IGTF_BOLIVARES
   */
  async getTaxRate(taxType: string, date: Date): Promise<number> {
    const rate = await this.prisma.taxRate.findFirst({
      where: {
        taxType,
        validFrom: { lte: date },
        OR: [{ validTo: null }, { validTo: { gte: date } }],
      },
      orderBy: { validFrom: 'desc' },
    });
    if (!rate) {
      throw new Error(`No se encontró tasa para el impuesto [${taxType}] en la fecha ${date.toISOString()}`);
    }
    return Number(rate.rate);
  }

  /**
   * Obtiene la tasa de cambio BCV de una moneda en una fecha dada.
   */
  async getExchangeRate(currencyCode: string, date: Date): Promise<number> {
    const er = await this.prisma.exchangeRate.findUnique({
      where: { currencyCode_date: { currencyCode, date } },
    });
    if (!er) {
      // Si no hay tasa exacta para esa fecha, buscamos la más reciente anterior
      const recent = await this.prisma.exchangeRate.findFirst({
        where: { currencyCode, date: { lte: date } },
        orderBy: { date: 'desc' },
      });
      if (!recent) {
        throw new Error(`No se encontró tasa de cambio para [${currencyCode}] en la fecha ${date.toISOString()}`);
      }
      return Number(recent.rate);
    }
    return Number(er.rate);
  }

  async findAllTaxRates() {
    return this.prisma.taxRate.findMany({ orderBy: { validFrom: 'desc' } });
  }

  async findAllExchangeRates(currencyCode?: string) {
    return this.prisma.exchangeRate.findMany({
      where: currencyCode ? { currencyCode } : {},
      orderBy: { date: 'desc' },
    });
  }

  async createExchangeRate(dto: { currencyCode: string; rate: number; date: Date }) {
    return this.prisma.exchangeRate.upsert({
      where: { currencyCode_date: { currencyCode: dto.currencyCode, date: dto.date } },
      create: { currencyCode: dto.currencyCode, rate: dto.rate, date: dto.date },
      update: { rate: dto.rate },
    });
  }
}
