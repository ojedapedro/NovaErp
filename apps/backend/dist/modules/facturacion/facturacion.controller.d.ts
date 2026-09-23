import { Response } from 'express';
import { FacturacionService } from './facturacion.service';
import { PdfService } from './pdf.service';
export declare class FacturacionController {
    private readonly facturacionService;
    private readonly pdfService;
    constructor(facturacionService: FacturacionService, pdfService: PdfService);
    listCustomers(companyId: string): Promise<{
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
    updateCustomer(companyId: string, id: string, dto: any): Promise<{
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
    listProducts(companyId: string): Promise<{
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
        stock: import("@prisma/client/runtime/library").Decimal;
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
        stock: import("@prisma/client/runtime/library").Decimal;
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
        stock: import("@prisma/client/runtime/library").Decimal;
    }>;
    listInvoices(companyId: string, status?: string, customerId?: string): Promise<({
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
        message: string;
    }>;
    downloadInvoicePdf(companyId: string, id: string, res: Response): Promise<void>;
}
