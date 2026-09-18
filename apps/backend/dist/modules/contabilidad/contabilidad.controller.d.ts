import { ContabilidadService } from './contabilidad.service';
export declare class ContabilidadController {
    private readonly contabilidadService;
    constructor(contabilidadService: ContabilidadService);
    listAccounts(companyId: string): Promise<({
        children: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            name: string;
            companyId: string;
            code: string;
            type: string;
            parentId: string | null;
            isControl: boolean;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        companyId: string;
        code: string;
        type: string;
        parentId: string | null;
        isControl: boolean;
    })[]>;
    createAccount(companyId: string, dto: {
        code: string;
        name: string;
        type: string;
        parentId?: string;
        isControl?: boolean;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        companyId: string;
        code: string;
        type: string;
        parentId: string | null;
        isControl: boolean;
    }>;
    listPeriods(companyId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        companyId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    }[]>;
    createPeriod(companyId: string, dto: {
        name: string;
        startDate: string;
        endDate: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        companyId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    }>;
    closePeriod(companyId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        companyId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    }>;
    listEntries(companyId: string, from?: string, to?: string): Promise<({
        lines: ({
            account: {
                name: string;
                code: string;
            };
        } & {
            id: string;
            description: string | null;
            entryDate: Date;
            journalEntryId: string;
            accountId: string;
            debit: import("@prisma/client/runtime/library").Decimal;
            credit: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        number: bigint;
        id: string;
        createdAt: Date;
        companyId: string;
        entryDate: Date;
        concept: string;
        isPosted: boolean;
    })[]>;
    createEntry(companyId: string, dto: {
        entryDate: string;
        concept: string;
        lines: Array<{
            accountId: string;
            debit: number;
            credit: number;
            description?: string;
        }>;
    }): Promise<any>;
    postEntry(companyId: string, id: string): Promise<{
        number: bigint;
        id: string;
        createdAt: Date;
        companyId: string;
        entryDate: Date;
        concept: string;
        isPosted: boolean;
    }>;
    trialBalance(companyId: string, from: string, to: string): Promise<{
        accountCode: any;
        accountName: any;
        accountType: any;
        totalDebit: number;
        totalCredit: number;
        balance: number;
    }[]>;
}
