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
exports.FiscalParamController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fiscal_param_service_1 = require("./fiscal-param.service");
const jwt_guard_1 = require("../../core/auth/guards/jwt.guard");
const roles_decorator_1 = require("../../core/auth/decorators/roles.decorator");
const user_role_enum_1 = require("../../core/auth/enums/user-role.enum");
let FiscalParamController = class FiscalParamController {
    fiscalParamService;
    constructor(fiscalParamService) {
        this.fiscalParamService = fiscalParamService;
    }
    async getTaxRate(taxType, dateStr) {
        const date = new Date(dateStr);
        const rate = await this.fiscalParamService.getTaxRate(taxType, date);
        return { taxType, date: dateStr, rate };
    }
    async getUnitTax(dateStr) {
        const date = new Date(dateStr);
        const value = await this.fiscalParamService.getUnitTaxValue(date);
        return { date: dateStr, unitTaxValue: value };
    }
    async listTaxRates() {
        return this.fiscalParamService.findAllTaxRates();
    }
    async listExchangeRates(currency) {
        return this.fiscalParamService.findAllExchangeRates(currency);
    }
    async createExchangeRate(body) {
        return this.fiscalParamService.createExchangeRate({
            currencyCode: body.currencyCode,
            rate: body.rate,
            date: new Date(body.date),
        });
    }
};
exports.FiscalParamController = FiscalParamController;
__decorate([
    (0, common_1.Get)('tax-rate'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener tasa de impuesto vigente en una fecha' }),
    __param(0, (0, common_1.Query)('taxType')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FiscalParamController.prototype, "getTaxRate", null);
__decorate([
    (0, common_1.Get)('ut'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener Unidad Tributaria vigente en una fecha' }),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FiscalParamController.prototype, "getUnitTax", null);
__decorate([
    (0, common_1.Get)('tax-rates'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas las tasas de impuesto' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FiscalParamController.prototype, "listTaxRates", null);
__decorate([
    (0, common_1.Get)('exchange-rates'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar tasas de cambio BCV' }),
    __param(0, (0, common_1.Query)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FiscalParamController.prototype, "listExchangeRates", null);
__decorate([
    (0, common_1.Post)('exchange-rates'),
    (0, roles_decorator_1.RequireRoles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.CONTADOR),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar tasa de cambio BCV del día' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FiscalParamController.prototype, "createExchangeRate", null);
exports.FiscalParamController = FiscalParamController = __decorate([
    (0, swagger_1.ApiTags)('Parametrización Fiscal'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('fiscal-param'),
    __metadata("design:paramtypes", [fiscal_param_service_1.FiscalParamService])
], FiscalParamController);
//# sourceMappingURL=fiscal-param.controller.js.map