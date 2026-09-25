import { PrismaService } from "../../core/database/prisma.service";
import { JournalAutomationService } from "../../core/accounting/journal-automation.service";
export declare class CxpService {
    private readonly prisma;
    private readonly journalAutomation;
    constructor(prisma: PrismaService, journalAutomation: JournalAutomationService);
    getPendingInvoices(companyId: string, supplierId?: string): Promise<({
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
    getAging(companyId: string): Promise<{
        '0-30': number;
        '31-60': number;
        '61-90': number;
        '+90': number;
    }>;
    getPayments(companyId: string): Promise<({
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
        items: ({
            purchaseInvoice: {
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
            purchaseInvoiceId: string;
            amountApplied: import("@prisma/client/runtime/library").Decimal;
            supplierPaymentId: string;
        })[];
    } & {
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        id: string;
        createdAt: Date;
        companyId: string;
        status: string;
        currency: string;
        notes: string | null;
        supplierId: string;
        receiptNumber: string;
        paymentDate: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        reference: string | null;
    })[]>;
    registerPayment(companyId: string, dto: any): Promise<{
        items: {
            id: string;
            purchaseInvoiceId: string;
            amountApplied: import("@prisma/client/runtime/library").Decimal;
            supplierPaymentId: string;
        }[];
    } & {
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        id: string;
        createdAt: Date;
        companyId: string;
        status: string;
        currency: string;
        notes: string | null;
        supplierId: string;
        receiptNumber: string;
        paymentDate: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        reference: string | null;
    }>;
}
