import { DashboardService } from "./dashboard.service";
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(companyId: string): Promise<{
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
