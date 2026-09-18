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
exports.FacturacionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const facturacion_service_1 = require("./facturacion.service");
const pdf_service_1 = require("./pdf.service");
const jwt_guard_1 = require("../../core/auth/guards/jwt.guard");
const roles_guard_1 = require("../../core/auth/guards/roles.guard");
const sod_guard_1 = require("../../core/auth/guards/sod.guard");
const roles_decorator_1 = require("../../core/auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../../core/auth/decorators/current-user.decorator");
const user_role_enum_1 = require("../../core/auth/enums/user-role.enum");
let FacturacionController = class FacturacionController {
    facturacionService;
    pdfService;
    constructor(facturacionService, pdfService) {
        this.facturacionService = facturacionService;
        this.pdfService = pdfService;
    }
    async listCustomers(companyId) {
        return this.facturacionService.findAllCustomers(companyId);
    }
    async createCustomer(companyId, dto) {
        return this.facturacionService.createCustomer(companyId, dto);
    }
    async updateCustomer(companyId, id, dto) {
        return this.facturacionService.updateCustomer(companyId, id, dto);
    }
    async listProducts(companyId) {
        return this.facturacionService.findAllProducts(companyId);
    }
    async createProduct(companyId, dto) {
        return this.facturacionService.createProduct(companyId, dto);
    }
    async updateProduct(companyId, id, dto) {
        return this.facturacionService.updateProduct(companyId, id, dto);
    }
    async listInvoices(companyId, status, customerId) {
        return this.facturacionService.findAllInvoices(companyId, { status, customerId });
    }
    async createInvoice(companyId, dto) {
        return this.facturacionService.createInvoice(companyId, dto);
    }
    async voidInvoice(companyId, id) {
        return this.facturacionService.voidInvoice(companyId, id);
    }
    async downloadInvoicePdf(companyId, id, res) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="factura_${id}.pdf"`);
        await this.pdfService.generateInvoicePdf(id, companyId, res);
    }
};
exports.FacturacionController = FacturacionController;
__decorate([
    (0, common_1.Get)('clientes'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar clientes' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FacturacionController.prototype, "listCustomers", null);
__decorate([
    (0, common_1.Post)('clientes'),
    (0, roles_decorator_1.RequireRoles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.CAJERO),
    (0, swagger_1.ApiOperation)({ summary: 'Crear cliente' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FacturacionController.prototype, "createCustomer", null);
__decorate([
    (0, common_1.Patch)('clientes/:id'),
    (0, roles_decorator_1.RequireRoles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.CAJERO),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar cliente' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FacturacionController.prototype, "updateCustomer", null);
__decorate([
    (0, common_1.Get)('productos'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar productos/servicios' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FacturacionController.prototype, "listProducts", null);
__decorate([
    (0, common_1.Post)('productos'),
    (0, roles_decorator_1.RequireRoles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.CONTADOR),
    (0, swagger_1.ApiOperation)({ summary: 'Crear producto/servicio' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FacturacionController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Patch)('productos/:id'),
    (0, roles_decorator_1.RequireRoles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.CONTADOR),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar producto' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FacturacionController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Get)('facturas'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar facturas' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FacturacionController.prototype, "listInvoices", null);
__decorate([
    (0, common_1.Post)('facturas'),
    (0, roles_decorator_1.RequireRoles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.CAJERO),
    (0, swagger_1.ApiOperation)({ summary: 'Emitir factura' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FacturacionController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Patch)('facturas/:id/anular'),
    (0, roles_decorator_1.RequireRoles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Anular factura' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FacturacionController.prototype, "voidInvoice", null);
__decorate([
    (0, common_1.Get)('facturas/:id/pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Descargar Factura PDF (Providencia 0102)' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FacturacionController.prototype, "downloadInvoicePdf", null);
exports.FacturacionController = FacturacionController = __decorate([
    (0, swagger_1.ApiTags)('Facturacion'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, sod_guard_1.SegregationOfDutiesGuard),
    (0, common_1.Controller)('facturacion'),
    __metadata("design:paramtypes", [facturacion_service_1.FacturacionService,
        pdf_service_1.PdfService])
], FacturacionController);
//# sourceMappingURL=facturacion.controller.js.map