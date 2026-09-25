import { PrismaService } from '../database/prisma.service';
export declare class SequenceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    nextVoucherNumber(companyId: string, prefix: string): Promise<string>;
    nextReceiptNumber(companyId: string, type: 'CXC' | 'CXP'): Promise<string>;
}
