import { PrismaService } from '../../core/database/prisma.service';
export declare class FacturacionService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllCustomers(companyId: string): Promise<{
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
    createCustomer(companyId: string, dto: {
        legalName: string;
        rif: string;
        address?: string;
        email?: string;
        phone?: string;
    }): Promise<{
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
    updateCustomer(companyId: string, id: string, dto: Partial<{
        legalName: string;
        rif: string;
        address: string;
        email: string;
        phone: string;
    }>): Promise<{
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
    findAllProducts(companyId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        description: string | null;
        companyId: string;
        taxType: string;
        code: string;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        unitMeasure: string;
    }[]>;
    createProduct(companyId: string, dto: {
        code: string;
        name: string;
        description?: string;
        unitPrice: number;
        unitMeasure?: string;
        taxType?: string;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        description: string | null;
        companyId: string;
        taxType: string;
        code: string;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        unitMeasure: string;
    }>;
    updateProduct(companyId: string, id: string, dto: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        description: string | null;
        companyId: string;
        taxType: string;
        code: string;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        unitMeasure: string;
    }>;
    findAllInvoices(companyId: string, params?: {
        status?: string;
        customerId?: string;
    }): Promise<({
        customer: {
            legalName: string;
            rif: string;
        };
        items: ({
            product: {
                name: string;
                code: string;
            };
        } & {
            taxRate: import("@prisma/client/runtime/library").Decimal;
            id: string;
            description: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string;
            productId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        number: bigint;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        id: string;
        createdAt: Date;
        companyId: string;
        status: string;
        journalEntryId: string | null;
        customerId: string;
        invoiceDate: Date;
        controlNumber: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        igtfAmount: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        notes: string | null;
    })[]>;
    createInvoice(companyId: string, dto: {
        customerId: string;
        invoiceDate: string;
        currency?: string;
        exchangeRate?: number;
        applyIgtf?: boolean;
        notes?: string;
        items: Array<{
            productId: string;
            description?: string;
            quantity: number;
            unitPrice: number;
        }>;
    }): Promise<{
        customer: {
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
        items: ({
            product: {
                name: string;
                code: string;
            };
        } & {
            taxRate: import("@prisma/client/runtime/library").Decimal;
            id: string;
            description: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string;
            productId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        number: bigint;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        id: string;
        createdAt: Date;
        companyId: string;
        status: string;
        journalEntryId: string | null;
        customerId: string;
        invoiceDate: Date;
        controlNumber: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        igtfAmount: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        notes: string | null;
    }>;
    voidInvoice(companyId: string, id: string): Promise<{
        number: bigint;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        id: string;
        createdAt: Date;
        companyId: string;
        status: string;
        journalEntryId: string | null;
        customerId: string;
        invoiceDate: Date;
        controlNumber: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        igtfAmount: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        notes: string | null;
    }>;
}
