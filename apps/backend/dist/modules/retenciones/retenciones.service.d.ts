import { PrismaService } from "../../core/database/prisma.service";
export declare class RetencionesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getIvaWithholdings(companyId: string): Promise<({
        purchaseInvoice: {
            supplier: {
                id: string;
                email: string | null;
                isActive: boolean;
                createdAt: Date;
                legalName: string;
                rif: string;
                companyId: string;
                address: string | null;
                phone: string | null;
            };
        } & {
            exchangeRate: import("@prisma/client/runtime/library").Decimal;
            id: string;
            createdAt: Date;
            companyId: string;
            status: string;
            journalEntryId: string | null;
            invoiceDate: Date;
            controlNumber: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
            amountPaid: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            notes: string | null;
            supplierId: string;
            invoiceNumber: string;
            exemptAmount: import("@prisma/client/runtime/library").Decimal;
            ivaWithheldAmount: import("@prisma/client/runtime/library").Decimal | null;
            ivaWithholdingNumber: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        companyId: string;
        status: string;
        purchaseInvoiceId: string;
        voucherNumber: string;
        withholdingDate: Date;
        withholdingPct: import("@prisma/client/runtime/library").Decimal;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        ivaAmount: import("@prisma/client/runtime/library").Decimal;
        withheldAmount: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    createIvaWithholding(companyId: string, dto: any): Promise<{
        id: string;
        createdAt: Date;
        companyId: string;
        status: string;
        purchaseInvoiceId: string;
        voucherNumber: string;
        withholdingDate: Date;
        withholdingPct: import("@prisma/client/runtime/library").Decimal;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        ivaAmount: import("@prisma/client/runtime/library").Decimal;
        withheldAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    exportarIvaTxt(companyId: string, year: number, month: number): Promise<string>;
    getIslrConcepts(companyId: string): Promise<{
        id: string;
        isActive: boolean;
        description: string;
        companyId: string;
        code: string;
        rateJuridica: import("@prisma/client/runtime/library").Decimal;
        rateNatural: import("@prisma/client/runtime/library").Decimal;
        sustraendoUt: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    seedIslrConcepts(companyId: string): Promise<{
        id: string;
        isActive: boolean;
        description: string;
        companyId: string;
        code: string;
        rateJuridica: import("@prisma/client/runtime/library").Decimal;
        rateNatural: import("@prisma/client/runtime/library").Decimal;
        sustraendoUt: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    getIslrWithholdings(companyId: string): Promise<({
        supplier: {
            id: string;
            email: string | null;
            isActive: boolean;
            createdAt: Date;
            legalName: string;
            rif: string;
            companyId: string;
            address: string | null;
            phone: string | null;
        };
        islrConcept: {
            id: string;
            isActive: boolean;
            description: string;
            companyId: string;
            code: string;
            rateJuridica: import("@prisma/client/runtime/library").Decimal;
            rateNatural: import("@prisma/client/runtime/library").Decimal;
            sustraendoUt: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        createdAt: Date;
        companyId: string;
        status: string;
        supplierId: string;
        purchaseInvoiceId: string | null;
        voucherNumber: string;
        withholdingDate: Date;
        withheldAmount: import("@prisma/client/runtime/library").Decimal;
        islrConceptId: string;
        personType: string;
        paymentAmount: import("@prisma/client/runtime/library").Decimal;
        withholdingRate: import("@prisma/client/runtime/library").Decimal;
        sustraendoBs: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    createIslrWithholding(companyId: string, dto: any): Promise<{
        id: string;
        createdAt: Date;
        companyId: string;
        status: string;
        supplierId: string;
        purchaseInvoiceId: string | null;
        voucherNumber: string;
        withholdingDate: Date;
        withheldAmount: import("@prisma/client/runtime/library").Decimal;
        islrConceptId: string;
        personType: string;
        paymentAmount: import("@prisma/client/runtime/library").Decimal;
        withholdingRate: import("@prisma/client/runtime/library").Decimal;
        sustraendoBs: import("@prisma/client/runtime/library").Decimal;
    }>;
}
