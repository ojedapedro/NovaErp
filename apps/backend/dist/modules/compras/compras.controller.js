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
exports.ComprasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const compras_service_1 = require("./compras.service");
const jwt_guard_1 = require("../../core/auth/guards/jwt.guard");
const current_user_decorator_1 = require("../../core/auth/decorators/current-user.decorator");
let ComprasController = class ComprasController {
    comprasService;
    constructor(comprasService) {
        this.comprasService = comprasService;
    }
    getSuppliers(companyId) {
        return this.comprasService.getSuppliers(companyId);
    }
    createSupplier(companyId, dto) {
        return this.comprasService.createSupplier(companyId, dto);
    }
    updateSupplier(companyId, id, dto) {
        return this.comprasService.updateSupplier(companyId, id, dto);
    }
    getPurchaseInvoices(companyId) {
        return this.comprasService.getPurchaseInvoices(companyId);
    }
    createPurchaseInvoice(companyId, dto) {
        return this.comprasService.createPurchaseInvoice(companyId, dto);
    }
};
exports.ComprasController = ComprasController;
__decorate([
    (0, common_1.Get)('proveedores'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar Proveedores' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ComprasController.prototype, "getSuppliers", null);
__decorate([
    (0, common_1.Post)('proveedores'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear Proveedor' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ComprasController.prototype, "createSupplier", null);
__decorate([
    (0, common_1.Patch)('proveedores/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar Proveedor' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ComprasController.prototype, "updateSupplier", null);
__decorate([
    (0, common_1.Get)('facturas'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar Facturas de Compra' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ComprasController.prototype, "getPurchaseInvoices", null);
__decorate([
    (0, common_1.Post)('facturas'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear Factura de Compra' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ComprasController.prototype, "createPurchaseInvoice", null);
exports.ComprasController = ComprasController = __decorate([
    (0, swagger_1.ApiTags)('Compras'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('compras'),
    __metadata("design:paramtypes", [compras_service_1.ComprasService])
], ComprasController);
//# sourceMappingURL=compras.controller.js.map