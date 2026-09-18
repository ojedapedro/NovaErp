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
exports.IvaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
let IvaService = class IvaService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLibroVentas(companyId, year, month) {
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
    async exportarTxtSeniat(companyId, year, month) {
        const libro = await this.getLibroVentas(companyId, year, month);
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        const rifEmpresa = company?.rif?.substring(0, 10) || "J-12345678-9";
        const periodo = year + String(month).padStart(2, "0");
        let txtContent = "";
        for (const linea of libro) {
            if (linea.estado === "VOID")
                continue;
            const campos = [rifEmpresa.replace(/-/g, ""), periodo, linea.operacion, linea.fecha.replace(/-/g, "/"), "C", linea.rif.replace(/-/g, ""), linea.razonSocial.substring(0, 50), "01", linea.numeroFactura, linea.numeroControl, linea.totalVentasConIva.toFixed(2), linea.baseImponible.toFixed(2), "0.00", "0", linea.fecha.replace(/-/g, "/"), linea.impuestoIva.toFixed(2), linea.alicuota.toFixed(2)];
            txtContent += campos.join("\t") + "\n";
        }
        return txtContent;
    }
    async getLibroCompras(companyId, year, month) {
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
    async exportarComprasTxtSeniat(companyId, year, month) {
        const libro = await this.getLibroCompras(companyId, year, month);
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        const rifEmpresa = company?.rif?.substring(0, 10) || "J-12345678-9";
        const periodo = year + String(month).padStart(2, "0");
        let txtContent = "";
        for (const linea of libro) {
            if (linea.estado === "VOID")
                continue;
            const campos = [rifEmpresa.replace(/-/g, ""), periodo, linea.operacion, linea.fecha.replace(/-/g, "/"), linea.rif.replace(/-/g, ""), linea.razonSocial.substring(0, 50), "01", linea.numeroFactura, linea.numeroControl, linea.totalComprasConIva.toFixed(2), linea.baseImponible.toFixed(2), linea.ivaRetenido.toFixed(2), linea.numeroComprobanteRetencion, linea.fecha.replace(/-/g, "/"), linea.impuestoIva.toFixed(2), linea.alicuota.toFixed(2)];
            txtContent += campos.join("\t") + "\n";
        }
        return txtContent;
    }
};
exports.IvaService = IvaService;
exports.IvaService = IvaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IvaService);
//# sourceMappingURL=iva.service.js.map