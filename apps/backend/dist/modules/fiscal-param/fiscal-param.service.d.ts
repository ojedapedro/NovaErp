import { PrismaService } from '../../core/database/prisma.service';
export declare class FiscalParamService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getUnitTaxValue(date: Date): Promise<number>;
    getTaxRate(taxType: string, date: Date): Promise<number>;
    getExchangeRate(currencyCode: string, date: Date): Promise<number>;
    findAllTaxRates(): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        validFrom: Date;
        validTo: Date | null;
        taxType: string;
        rate: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    findAllExchangeRates(currencyCode?: string): Promise<{
        id: string;
        createdAt: Date;
        rate: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
        date: Date;
    }[]>;
    createExchangeRate(dto: {
        currencyCode: string;
        rate: number;
        date: Date;
    }): Promise<{
        id: string;
        createdAt: Date;
        rate: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
        date: Date;
    }>;
}
