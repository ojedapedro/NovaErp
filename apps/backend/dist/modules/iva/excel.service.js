"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelService = void 0;
const common_1 = require("@nestjs/common");
const ExcelJS = __importStar(require("exceljs"));
let ExcelService = class ExcelService {
    async exportVentasToExcel(data, res) {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Libro de Ventas');
        sheet.columns = [
            { header: 'Operación', key: 'operacion', width: 10 },
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'RIF', key: 'rif', width: 15 },
            { header: 'Razón Social', key: 'razonSocial', width: 35 },
            { header: 'N° Factura', key: 'numeroFactura', width: 15 },
            { header: 'N° Control', key: 'numeroControl', width: 15 },
            { header: 'Tipo Doc', key: 'tipoDocumento', width: 10 },
            { header: 'Fact Afectada', key: 'numeroFacturaAfectada', width: 15 },
            { header: 'Total c/IVA', key: 'totalVentasConIva', width: 15 },
            { header: 'Ventas No Gravadas', key: 'ventasNoGravadas', width: 18 },
            { header: 'Base Imponible', key: 'baseImponible', width: 15 },
            { header: '% IVA', key: 'alicuota', width: 10 },
            { header: 'Impuesto IVA', key: 'impuestoIva', width: 15 },
            { header: 'IVA Retenido', key: 'ivaRetenido', width: 15 }
        ];
        sheet.addRows(data);
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).alignment = { horizontal: 'center' };
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=libro_ventas.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    }
    async exportComprasToExcel(data, res) {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Libro de Compras');
        sheet.columns = [
            { header: 'Operación', key: 'operacion', width: 10 },
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'RIF', key: 'rif', width: 15 },
            { header: 'Razón Social', key: 'razonSocial', width: 35 },
            { header: 'N° Factura', key: 'numeroFactura', width: 15 },
            { header: 'N° Control', key: 'numeroControl', width: 15 },
            { header: 'Tipo Doc', key: 'tipoDocumento', width: 10 },
            { header: 'Total c/IVA', key: 'totalComprasConIva', width: 15 },
            { header: 'Compras No Gravadas', key: 'comprasNoGravadas', width: 18 },
            { header: 'Base Imponible', key: 'baseImponible', width: 15 },
            { header: '% IVA', key: 'alicuota', width: 10 },
            { header: 'Impuesto IVA', key: 'impuestoIva', width: 15 },
            { header: 'IVA Retenido', key: 'ivaRetenido', width: 15 }
        ];
        sheet.addRows(data);
        sheet.getRow(1).font = { bold: true };
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=libro_compras.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    }
};
exports.ExcelService = ExcelService;
exports.ExcelService = ExcelService = __decorate([
    (0, common_1.Injectable)()
], ExcelService);
//# sourceMappingURL=excel.service.js.map