import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";

@Injectable()
export class IvaService {
  constructor(private readonly prisma: PrismaService) {}

  async getLibroVentas(companyId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const invoices = await this.prisma.invoice.findMany({
      where: { companyId, invoiceDate: { gte: startDate, lte: endDate } },
      include: { customer: true },
      orderBy: { invoiceDate: "asc" },
    });
    return invoices.map((inv, index) => {
      const isVoid = inv.status === "VOID";
      const totalVentas = isVoid ? 0 : Number(inv.total);
      const baseImponible = isVoid ? 0 : Number(inv.subtotal);
      const impuestoIva = isVoid ? 0 : Number(inv.taxAmount);
      const igtf = isVoid ? 0 : Number(inv.igtfAmount);
      return {
        operacion: index + 1,
        fecha: inv.invoiceDate.toISOString().split("T")[0],
        rif: inv.customer.rif,
        razonSocial: isVoid ? "ANULADA" : inv.customer.legalName,
        numeroFactura: String(inv.number).padStart(6, "0"),
        numeroControl: inv.controlNumber || String(inv.number).padStart(6, "0"),
        tipoDocumento: "Factura",
        totalVentasConIva: totalVentas,
        ventasNoGravadas: 0,
        baseImponible,
        alicuota: baseImponible > 0 ? 16 : 0,
        impuestoIva,
        igtfPercibido: igtf,
        estado: inv.status,
      };
    });
  }

  async exportarTxtSeniat(companyId: string, year: number, month: number): Promise<string> {
    const libro = await this.getLibroVentas(companyId, year, month);
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    const rifEmpresa = company?.rif?.substring(0, 10) || "J-12345678-9";
    const periodo = year + String(month).padStart(2, "0");
    let txtContent = "";
    for (const linea of libro) {
      if (linea.estado === "VOID") continue;
      const campos = [rifEmpresa.replace(/-/g, ""), periodo, linea.operacion, linea.fecha.replace(/-/g, "/"), "C", linea.rif.replace(/-/g, ""), linea.razonSocial.substring(0, 50), "01", linea.numeroFactura, linea.numeroControl, linea.totalVentasConIva.toFixed(2), linea.baseImponible.toFixed(2), "0.00", "0", linea.fecha.replace(/-/g, "/"), linea.impuestoIva.toFixed(2), linea.alicuota.toFixed(2)];
      txtContent += campos.join("\t") + "\n";
    }
    return txtContent;
  }

  async getLibroCompras(companyId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const invoices = await this.prisma.purchaseInvoice.findMany({
      where: { companyId, invoiceDate: { gte: startDate, lte: endDate } },
      include: { supplier: true },
      orderBy: { invoiceDate: "asc" },
    });
    return invoices.map((inv, index) => {
      const isVoid = inv.status === "VOID";
      const totalCompras = isVoid ? 0 : Number(inv.total);
      const baseImponible = isVoid ? 0 : Number(inv.subtotal);
      const impuestoIva = isVoid ? 0 : Number(inv.taxAmount);
      const comprasExentas = isVoid ? 0 : Number(inv.exemptAmount);
      const retencion = isVoid ? 0 : Number(inv.ivaWithheldAmount || 0);
      return {
        operacion: index + 1,
        fecha: inv.invoiceDate.toISOString().split("T")[0],
        rif: inv.supplier.rif,
        razonSocial: isVoid ? "ANULADA" : inv.supplier.legalName,
        numeroFactura: inv.invoiceNumber,
        numeroControl: inv.controlNumber,
        tipoDocumento: "Factura",
        numeroComprobanteRetencion: inv.ivaWithholdingNumber || "",
        totalComprasConIva: totalCompras,
        comprasExentas,
        baseImponible,
        alicuota: baseImponible > 0 ? 16 : 0,
        impuestoIva,
        ivaRetenido: retencion,
        estado: inv.status,
      };
    });
  }

  async exportarComprasTxtSeniat(companyId: string, year: number, month: number): Promise<string> {
    const libro = await this.getLibroCompras(companyId, year, month);
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    const rifEmpresa = company?.rif?.substring(0, 10) || "J-12345678-9";
    const periodo = year + String(month).padStart(2, "0");
    let txtContent = "";
    for (const linea of libro) {
      if (linea.estado === "VOID") continue;
      const campos = [rifEmpresa.replace(/-/g, ""), periodo, linea.operacion, linea.fecha.replace(/-/g, "/"), linea.rif.replace(/-/g, ""), linea.razonSocial.substring(0, 50), "01", linea.numeroFactura, linea.numeroControl, linea.totalComprasConIva.toFixed(2), linea.baseImponible.toFixed(2), linea.ivaRetenido.toFixed(2), linea.numeroComprobanteRetencion, linea.fecha.replace(/-/g, "/"), linea.impuestoIva.toFixed(2), linea.alicuota.toFixed(2)];
      txtContent += campos.join("\t") + "\n";
    }
    return txtContent;
  }
}
