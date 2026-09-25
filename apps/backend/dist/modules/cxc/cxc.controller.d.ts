import { CxcService } from "./cxc.service";
export declare class CxcController {
    private readonly cxcService;
    constructor(cxcService: CxcService);
    getPendingInvoices(companyId: string, customerId?: string): Promise<({
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
    getAging(companyId: string): Promise<{
        '0-30': number;
        '31-60': number;
        '61-90': number;
        '+90': number;
    }>;
    getPayments(companyId: string): Promise<({
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
            invoice: {
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
            };
        } & {
            id: string;
            invoiceId: string;
            customerPaymentId: string;
            amountApplied: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        id: string;
        createdAt: Date;
        companyId: string;
        status: string;
        customerId: string;
        currency: string;
        notes: string | null;
        receiptNumber: string;
        paymentDate: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        reference: string | null;
    })[]>;
    registerPayment(companyId: string, dto: any): Promise<{
        items: {
            id: string;
            invoiceId: string;
            customerPaymentId: string;
            amountApplied: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        id: string;
        createdAt: Date;
        companyId: string;
        status: string;
        customerId: string;
        currency: string;
        notes: string | null;
        receiptNumber: string;
        paymentDate: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        reference: string | null;
    }>;
}
