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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IvaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const iva_service_1 = require("./iva.service");
const excel_service_1 = require("./excel.service");
const jwt_guard_1 = require("../../core/auth/guards/jwt.guard");
const current_user_decorator_1 = require("../../core/auth/decorators/current-user.decorator");
let IvaController = class IvaController {
    ivaService;
    excelService;
    constructor(ivaService, excelService) {
        this.ivaService = ivaService;
        this.excelService = excelService;
    }
    async getLibroVentas(companyId, year, month) {
        const y = parseInt(year) || new Date().getFullYear();
        const m = parseInt(month) || new Date().getMonth() + 1;
        return this.ivaService.getLibroVentas(companyId, y, m);
    }
    async exportarVentasTxt(companyId, year, month, res) {
        const y = parseInt(year) || new Date().getFullYear();
        const m = parseInt(month) || new Date().getMonth() + 1;
        const txt = await this.ivaService.exportarTxtSeniat(companyId, y, m);
        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Content-Disposition", `attachment; filename="ventas_${y}_${m}.txt"`);
        return res.send(txt);
    }
    async getLibroCompras(companyId, year, month) {
        const y = parseInt(year) || new Date().getFullYear();
        const m = parseInt(month) || new Date().getMonth() + 1;
        return this.ivaService.getLibroCompras(companyId, y, m);
    }
    async exportarComprasTxt(companyId, year, month, res) {
        const y = parseInt(year) || new Date().getFullYear();
        const m = parseInt(month) || new Date().getMonth() + 1;
        const txt = await this.ivaService.exportarComprasTxtSeniat(companyId, y, m);
        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Content-Disposition", `attachment; filename="compras_${y}_${m}.txt"`);
        return res.send(txt);
    }
    async exportarVentasExcel(companyId, year, month, res) {
        const y = parseInt(year) || new Date().getFullYear();
        const m = parseInt(month) || new Date().getMonth() + 1;
        const data = await this.ivaService.getLibroVentas(companyId, y, m);
        return this.excelService.exportVentasToExcel(data, res);
    }
    async exportarComprasExcel(companyId, year, month, res) {
        const y = parseInt(year) || new Date().getFullYear();
        const m = parseInt(month) || new Date().getMonth() + 1;
        const data = await this.ivaService.getLibroCompras(companyId, y, m);
        return this.excelService.exportComprasToExcel(data, res);
    }
};
exports.IvaController = IvaController;
__decorate([
    (0, common_1.Get)("libro-ventas"),
    (0, swagger_1.ApiOperation)({ summary: "Obtener Libro de Ventas" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Query)("year")),
    __param(2, (0, common_1.Query)("month")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], IvaController.prototype, "getLibroVentas", null);
__decorate([
    (0, common_1.Get)("libro-ventas/exportar-txt"),
    (0, swagger_1.ApiOperation)({ summary: "Exportar TXT SENIAT Libro de Ventas" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Query)("year")),
    __param(2, (0, common_1.Query)("month")),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], IvaController.prototype, "exportarVentasTxt", null);
__decorate([
    (0, common_1.Get)("libro-compras"),
    (0, swagger_1.ApiOperation)({ summary: "Obtener Libro de Compras" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Query)("year")),
    __param(2, (0, common_1.Query)("month")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], IvaController.prototype, "getLibroCompras", null);
__decorate([
    (0, common_1.Get)("libro-compras/exportar-txt"),
    (0, swagger_1.ApiOperation)({ summary: "Exportar TXT SENIAT Libro de Compras" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Query)("year")),
    __param(2, (0, common_1.Query)("month")),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], IvaController.prototype, "exportarComprasTxt", null);
__decorate([
    (0, common_1.Get)("libro-ventas/excel"),
    (0, swagger_1.ApiOperation)({ summary: "Exportar Excel Libro de Ventas" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Query)("year")),
    __param(2, (0, common_1.Query)("month")),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], IvaController.prototype, "exportarVentasExcel", null);
__decorate([
    (0, common_1.Get)("libro-compras/excel"),
    (0, swagger_1.ApiOperation)({ summary: "Exportar Excel Libro de Compras" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Query)("year")),
    __param(2, (0, common_1.Query)("month")),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], IvaController.prototype, "exportarComprasExcel", null);
exports.IvaController = IvaController = __decorate([
    (0, swagger_1.ApiTags)("Impuestos e IVA"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("iva"),
    __metadata("design:paramtypes", [iva_service_1.IvaService,
        excel_service_1.ExcelService])
], IvaController);
//# sourceMappingURL=iva.controller.js.map