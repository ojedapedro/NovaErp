import { PrismaService } from "../../core/database/prisma.service";
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(companyId: string): Promise<{
        totalVentas: number;
        totalCobrado: number;
        cuentasPorCobrar: number;
        totalCompras: number;
        totalPagado: number;
        cuentasPorPagar: number;
        customersCount: number;
        productsCount: number;
        chartData: any[];
    }>;
}
