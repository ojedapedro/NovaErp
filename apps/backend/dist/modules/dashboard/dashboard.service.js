"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats(companyId) {
        const sales = await this.prisma.invoice.aggregate({
            where: { companyId, status: { not: "VOID" } },
            _sum: { total: true, amountPaid: true },
        });
        const purchases = await this.prisma.purchaseInvoice.aggregate({
            where: { companyId, status: { not: "VOID" } },
            _sum: { total: true, amountPaid: true },
        });
        const customersCount = await this.prisma.customer.count({ where: { companyId } });
        const productsCount = await this.prisma.product.count({ where: { companyId } });
        const currentDate = new Date();
        const sixMonthsAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 5));
        sixMonthsAgo.setDate(1);
        const recentSales = await this.prisma.invoice.findMany({
            where: { companyId, status: { not: "VOID" }, invoiceDate: { gte: sixMonthsAgo } },
            select: { invoiceDate: true, total: true },
        });
        const recentPurchases = await this.prisma.purchaseInvoice.findMany({
            where: { companyId, status: { not: "VOID" }, invoiceDate: { gte: sixMonthsAgo } },
            select: { invoiceDate: true, total: true },
        });
        const monthlyData = new Map();
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            monthlyData.set(key, { month: key, ventas: 0, compras: 0 });
        }
        recentSales.forEach(s => {
            const key = `${s.invoiceDate.getFullYear()}-${String(s.invoiceDate.getMonth() + 1).padStart(2, "0")}`;
            if (monthlyData.has(key)) {
                monthlyData.get(key).ventas += Number(s.total);
            }
        });
        recentPurchases.forEach(p => {
            const key = `${p.invoiceDate.getFullYear()}-${String(p.invoiceDate.getMonth() + 1).padStart(2, "0")}`;
            if (monthlyData.has(key)) {
                monthlyData.get(key).compras += Number(p.total);
            }
        });
        return {
            totalVentas: Number(sales._sum.total || 0),
            totalCobrado: Number(sales._sum.amountPaid || 0),
            cuentasPorCobrar: Number(sales._sum.total || 0) - Number(sales._sum.amountPaid || 0),
            totalCompras: Number(purchases._sum.total || 0),
            totalPagado: Number(purchases._sum.amountPaid || 0),
            cuentasPorPagar: Number(purchases._sum.total || 0) - Number(purchases._sum.amountPaid || 0),
            customersCount,
            productsCount,
            chartData: Array.from(monthlyData.values()).sort((a, b) => a.month.localeCompare(b.month)),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map