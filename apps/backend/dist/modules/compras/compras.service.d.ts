import { PrismaService } from '../../core/database/prisma.service';
export declare class ComprasService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSuppliers(companyId: string): Promise<{
        id: string;
        email: string | null;
        isActive: boolean;
        createdAt: Date;
        legalName: string;
        rif: string;
        companyId: string;
        address: string | null;
        phone: string | null;
    }[]>;
    createSupplier(companyId: string, dto: any): Promise<{
        id: string;
        email: string | null;
        isActive: boolean;
        createdAt: Date;
        legalName: string;
        rif: string;
        companyId: string;
        address: string | null;
        phone: string | null;
    }>;
    updateSupplier(companyId: string, id: string, dto: any): Promise<{
        id: string;
        email: string | null;
        isActive: boolean;
        createdAt: Date;
        legalName: string;
        rif: string;
        companyId: string;
        address: string | null;
        phone: string | null;
    }>;
    getPurchaseInvoices(companyId: string): Promise<({
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
    })[]>;
    createPurchaseInvoice(companyId: string, dto: any): Promise<{
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
    }>;
}
