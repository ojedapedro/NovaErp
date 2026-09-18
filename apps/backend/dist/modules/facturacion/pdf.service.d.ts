import { PrismaService } from "../../core/database/prisma.service";
import { Writable } from "stream";
export declare class PdfService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generateInvoicePdf(invoiceId: string, companyId: string, stream: Writable): Promise<void>;
}
