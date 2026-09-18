import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(companyId: string) {
    // 1. Ingresos totales (Facturas emitidas y cobradas vs total)
    const sales = await this.prisma.invoice.aggregate({
      where: { companyId, status: { not: "VOID" } },
      _sum: { total: true, amountPaid: true },
    });
    
    // 2. Egresos totales (Compras a proveedores)
    const purchases = await this.prisma.purchaseInvoice.aggregate({
      where: { companyId, status: { not: "VOID" } },
      _sum: { total: true, amountPaid: true },
    });

    // 3. Cantidad de clientes y productos
    const customersCount = await this.prisma.customer.count({ where: { companyId } });
    const productsCount = await this.prisma.product.count({ where: { companyId } });

    // 4. Ventas de los últimos 6 meses (para gráfico)
    const currentDate = new Date();
    const sixMonthsAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 5));
    sixMonthsAgo.setDate(1); // Primer día de ese mes
    
    const recentSales = await this.prisma.invoice.findMany({
      where: { companyId, status: { not: "VOID" }, invoiceDate: { gte: sixMonthsAgo } },
      select: { invoiceDate: true, total: true },
    });
    
    const recentPurchases = await this.prisma.purchaseInvoice.findMany({
      where: { companyId, status: { not: "VOID" }, invoiceDate: { gte: sixMonthsAgo } },
      select: { invoiceDate: true, total: true },
    });

    // Agrupar por mes
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
}
