import { PrismaService } from '../../core/database/prisma.service';
export declare class ComprasService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSuppliers(companyId: string): Promise<{
        id: string;
        companyId: string;
        legalName: string;
        rif: string;
        address: string | null;
        email: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    createSupplier(companyId: string, dto: any): Promise<{
        id: string;
        companyId: string;
        legalName: string;
        rif: string;
        address: string | null;
        email: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    updateSupplier(companyId: string, id: string, dto: any): Promise<{
        id: string;
        companyId: string;
        legalName: string;
        rif: string;
        address: string | null;
        email: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    getPurchaseInvoices(companyId: string): Promise<({
        supplier: {
            id: string;
            companyId: string;
            legalName: string;
            rif: string;
            address: string | null;
            email: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
        };
        items: {
            id: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
            purchaseInvoiceId: string;
            productId: string | null;
            description: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            taxRate: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        supplierId: string;
        invoiceNumber: string;
        controlNumber: string;
        invoiceDate: Date;
        status: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        exemptAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        ivaWithheldAmount: import("@prisma/client/runtime/library").Decimal | null;
        ivaWithholdingNumber: string | null;
        journalEntryId: string | null;
    })[]>;
    createPurchaseInvoice(companyId: string, dto: any): Promise<{
        items: {
            id: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
            purchaseInvoiceId: string;
            productId: string | null;
            description: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            taxRate: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        supplierId: string;
        invoiceNumber: string;
        controlNumber: string;
        invoiceDate: Date;
        status: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        exemptAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        ivaWithheldAmount: import("@prisma/client/runtime/library").Decimal | null;
        ivaWithholdingNumber: string | null;
        journalEntryId: string | null;
    }>;
}
