import { FiscalParamService } from './fiscal-param.service';
export declare class FiscalParamController {
    private readonly fiscalParamService;
    constructor(fiscalParamService: FiscalParamService);
    getTaxRate(taxType: string, dateStr: string): Promise<{
        taxType: string;
        date: string;
        rate: number;
    }>;
    getUnitTax(dateStr: string): Promise<{
        date: string;
        unitTaxValue: number;
    }>;
    listTaxRates(): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        validFrom: Date;
        validTo: Date | null;
        taxType: string;
        rate: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    listExchangeRates(currency?: string): Promise<{
        id: string;
        createdAt: Date;
        rate: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
        date: Date;
    }[]>;
    createExchangeRate(body: {
        currencyCode: string;
        rate: number;
        date: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        rate: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
        date: Date;
    }>;
}
