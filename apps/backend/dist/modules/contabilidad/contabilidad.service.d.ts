import { PrismaService } from '../../core/database/prisma.service';
export declare class ContabilidadService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllAccounts(companyId: string): Promise<({
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
    findAllPeriods(companyId: string): Promise<{
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
        startDate: Date;
        endDate: Date;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        companyId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    }>;
    closePeriod(companyId: string, periodId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        companyId: string;
        startDate: Date;
        endDate: Date;
        status: string;
    }>;
    findAllJournalEntries(companyId: string, filters?: {
        fromDate?: Date;
        toDate?: Date;
    }): Promise<({
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
    createJournalEntry(companyId: string, dto: {
        entryDate: Date;
        concept: string;
        lines: Array<{
            accountId: string;
            debit: number;
            credit: number;
            description?: string;
        }>;
    }): Promise<any>;
    postJournalEntry(companyId: string, entryId: string): Promise<{
        number: bigint;
        id: string;
        createdAt: Date;
        companyId: string;
        entryDate: Date;
        concept: string;
        isPosted: boolean;
    }>;
    getTrialBalance(companyId: string, fromDate: Date, toDate: Date): Promise<{
        accountCode: any;
        accountName: any;
        accountType: any;
        totalDebit: number;
        totalCredit: number;
        balance: number;
    }[]>;
}
