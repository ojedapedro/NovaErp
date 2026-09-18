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
exports.FiscalParamService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
let FiscalParamService = class FiscalParamService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUnitTaxValue(date) {
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
    async getTaxRate(taxType, date) {
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
    async getExchangeRate(currencyCode, date) {
        const er = await this.prisma.exchangeRate.findUnique({
            where: { currencyCode_date: { currencyCode, date } },
        });
        if (!er) {
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
    async findAllExchangeRates(currencyCode) {
        return this.prisma.exchangeRate.findMany({
            where: currencyCode ? { currencyCode } : {},
            orderBy: { date: 'desc' },
        });
    }
    async createExchangeRate(dto) {
        return this.prisma.exchangeRate.upsert({
            where: { currencyCode_date: { currencyCode: dto.currencyCode, date: dto.date } },
            create: { currencyCode: dto.currencyCode, rate: dto.rate, date: dto.date },
            update: { rate: dto.rate },
        });
    }
};
exports.FiscalParamService = FiscalParamService;
exports.FiscalParamService = FiscalParamService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FiscalParamService);
//# sourceMappingURL=fiscal-param.service.js.map