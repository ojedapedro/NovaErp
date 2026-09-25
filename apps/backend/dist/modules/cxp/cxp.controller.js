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
exports.CxpController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cxp_service_1 = require("./cxp.service");
const jwt_guard_1 = require("../../core/auth/guards/jwt.guard");
const current_user_decorator_1 = require("../../core/auth/decorators/current-user.decorator");
let CxpController = class CxpController {
    cxpService;
    constructor(cxpService) {
        this.cxpService = cxpService;
    }
    getPendingInvoices(companyId, supplierId) {
        return this.cxpService.getPendingInvoices(companyId, supplierId);
    }
    getAging(companyId) {
        return this.cxpService.getAging(companyId);
    }
    getPayments(companyId) {
        return this.cxpService.getPayments(companyId);
    }
    registerPayment(companyId, dto) {
        return this.cxpService.registerPayment(companyId, dto);
    }
};
exports.CxpController = CxpController;
__decorate([
    (0, common_1.Get)("facturas-pendientes"),
    (0, swagger_1.ApiOperation)({ summary: "Listar facturas pendientes de pago a proveedores" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Query)("supplierId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CxpController.prototype, "getPendingInvoices", null);
__decorate([
    (0, common_1.Get)("aging"),
    (0, swagger_1.ApiOperation)({ summary: "Obtener antigüedad de saldos (Aging) CxP" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CxpController.prototype, "getAging", null);
__decorate([
    (0, common_1.Get)("pagos"),
    (0, swagger_1.ApiOperation)({ summary: "Listar egresos / pagos a proveedores" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CxpController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Post)("pagos"),
    (0, swagger_1.ApiOperation)({ summary: "Registrar pago a proveedor" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CxpController.prototype, "registerPayment", null);
exports.CxpController = CxpController = __decorate([
    (0, swagger_1.ApiTags)("Cuentas por Pagar"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("cxp"),
    __metadata("design:paramtypes", [cxp_service_1.CxpService])
], CxpController);
//# sourceMappingURL=cxp.controller.js.map