import { PrismaService } from '../../core/database/prisma.service';
export declare class InventarioService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getKardex(companyId: string, productId: string): Promise<({
        product: {
            name: string;
            code: string;
            unitMeasure: string;
        };
    } & {
        id: string;
        createdAt: Date;
        companyId: string;
        concept: string;
        notes: string | null;
        productId: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        movementType: string;
        unitCost: import("@prisma/client/runtime/library").Decimal;
        totalCost: import("@prisma/client/runtime/library").Decimal;
        referenceId: string | null;
        referenceNumber: string | null;
    })[]>;
    getInventarioValorizado(companyId: string): Promise<{
        costoPromedio: number;
        valorTotal: number;
        id: string;
        name: string;
        code: string;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        unitMeasure: string;
        stock: import("@prisma/client/runtime/library").Decimal;
        lastCost: import("@prisma/client/runtime/library").Decimal;
        averageCost: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    registrarAjuste(companyId: string, dto: any): Promise<{
        id: string;
        createdAt: Date;
        companyId: string;
        concept: string;
        notes: string | null;
        productId: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        movementType: string;
        unitCost: import("@prisma/client/runtime/library").Decimal;
        totalCost: import("@prisma/client/runtime/library").Decimal;
        referenceId: string | null;
        referenceNumber: string | null;
    }>;
}
