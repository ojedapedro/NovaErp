import { Prisma } from '@prisma/client';
export declare class JournalAutomationService {
    private readonly logger;
    postInvoiceEntry(tx: Prisma.TransactionClient, companyId: string, invoice: any, items: any[]): Promise<void>;
    postPurchaseEntry(tx: Prisma.TransactionClient, companyId: string, invoice: any, items: any[]): Promise<void>;
    postReceiptEntry(tx: Prisma.TransactionClient, companyId: string, payment: any): Promise<void>;
    postSupplierPaymentEntry(tx: Prisma.TransactionClient, companyId: string, payment: any): Promise<void>;
    postIvaWithholdingEntry(tx: Prisma.TransactionClient, companyId: string, withholding: any, invoice: any): Promise<void>;
    postPayrollEntry(tx: Prisma.TransactionClient, companyId: string, period: any, items: any[]): Promise<void>;
    private getNextVoucherNumber;
    private findAccounts;
}
