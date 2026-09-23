import { InventarioService } from './inventario.service';
export declare class InventarioController {
    private readonly inventarioService;
    constructor(inventarioService: InventarioService);
    getInventarioValorizado(companyId: string): Promise<{
        costoPromedio: any;
        valorTotal: number;
        id: string;
        name: string;
        code: string;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        unitMeasure: string;
        stock: import("@prisma/client/runtime/library").Decimal;
    }[]>;
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
