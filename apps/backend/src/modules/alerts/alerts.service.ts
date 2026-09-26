import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../core/database/prisma.service";

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getUnreadAlerts(companyId: string) {
    return this.prisma.alert.findMany({
      where: { companyId, isRead: false },
      orderBy: { createdAt: "desc" },
    });
  }

  async markAsRead(companyId: string, alertId: string) {
    return this.prisma.alert.updateMany({
      where: { id: alertId, companyId },
      data: { isRead: true },
    });
  }

  // 1. Tarea Nocturna: Inventario Bajo
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkLowInventory() {
    this.logger.log("Ejecutando chequeo de inventario mínimo (CRON)...");
    const products = await this.prisma.product.findMany({
      where: { stock: { lte: 5 }, isActive: true },
    });

    for (const p of products) {
      await this.prisma.alert.create({
        data: {
          companyId: p.companyId,
          type: "LOW_STOCK",
          title: "Inventario Bajo",
          message: `El producto ${p.name} (Código: ${p.code}) tiene un stock crítico de ${p.stock.toString()} ${p.unitMeasure}.`,
        },
      });
    }
    this.logger.log(`Se generaron ${products.length} alertas de inventario.`);
  }

  // 2. Tarea Nocturna: Clientes Morosos (+90 días)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkOverdueInvoices() {
    this.logger.log("Ejecutando chequeo de facturas en mora (CRON)...");
    const today = new Date().getTime();
    
    const invoices = await this.prisma.invoice.findMany({
      where: { status: { not: "VOID" } },
      include: { customer: true },
    });

    let count = 0;
    for (const inv of invoices) {
      const balance = Number(inv.total) - Number(inv.amountPaid);
      if (balance <= 0) continue;
      
      const diffDays = Math.floor((today - inv.invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 90) {
        // Validar que no se haya notificado esta factura en los últimos 7 días para no hacer spam
        const recentAlert = await this.prisma.alert.findFirst({
          where: {
            companyId: inv.companyId,
            type: "OVERDUE_INVOICE",
            message: { contains: inv.controlNumber || inv.number.toString() },
            createdAt: { gte: new Date(today - 7 * 24 * 60 * 60 * 1000) }
          }
        });
        
        if (!recentAlert) {
          await this.prisma.alert.create({
            data: {
              companyId: inv.companyId,
              type: "OVERDUE_INVOICE",
              title: "Cliente Moroso (+90 días)",
              message: `El cliente ${inv.customer.legalName} tiene la factura ${inv.controlNumber || inv.number.toString()} vencida por ${diffDays} días (Saldo pendiente: $${balance.toFixed(2)}).`,
            },
          });
          count++;
        }
      }
    }
    this.logger.log(`Se generaron ${count} alertas de facturas vencidas.`);
  }
}
