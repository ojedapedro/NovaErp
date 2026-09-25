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
exports.CxcController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cxc_service_1 = require("./cxc.service");
const jwt_guard_1 = require("../../core/auth/guards/jwt.guard");
const current_user_decorator_1 = require("../../core/auth/decorators/current-user.decorator");
let CxcController = class CxcController {
    cxcService;
    constructor(cxcService) {
        this.cxcService = cxcService;
    }
    getPendingInvoices(companyId, customerId) {
        return this.cxcService.getPendingInvoices(companyId, customerId);
    }
    getAging(companyId) {
        return this.cxcService.getAging(companyId);
    }
    getPayments(companyId) {
        return this.cxcService.getPayments(companyId);
    }
    registerPayment(companyId, dto) {
        return this.cxcService.registerPayment(companyId, dto);
    }
};
exports.CxcController = CxcController;
__decorate([
    (0, common_1.Get)("facturas-pendientes"),
    (0, swagger_1.ApiOperation)({ summary: "Listar facturas pendientes de cobro" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Query)("customerId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CxcController.prototype, "getPendingInvoices", null);
__decorate([
    (0, common_1.Get)("aging"),
    (0, swagger_1.ApiOperation)({ summary: "Obtener antigüedad de saldos (Aging) CxC" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CxcController.prototype, "getAging", null);
__decorate([
    (0, common_1.Get)("pagos"),
    (0, swagger_1.ApiOperation)({ summary: "Listar recibos de pago" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CxcController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Post)("pagos"),
    (0, swagger_1.ApiOperation)({ summary: "Registrar recibo de pago" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CxcController.prototype, "registerPayment", null);
exports.CxcController = CxcController = __decorate([
    (0, swagger_1.ApiTags)("Cuentas por Cobrar"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("cxc"),
    __metadata("design:paramtypes", [cxc_service_1.CxcService])
], CxcController);
//# sourceMappingURL=cxc.controller.js.map