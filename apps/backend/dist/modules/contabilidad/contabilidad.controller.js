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
exports.ContabilidadController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const contabilidad_service_1 = require("./contabilidad.service");
const jwt_guard_1 = require("../../core/auth/guards/jwt.guard");
const roles_guard_1 = require("../../core/auth/guards/roles.guard");
const sod_guard_1 = require("../../core/auth/guards/sod.guard");
const roles_decorator_1 = require("../../core/auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../../core/auth/decorators/current-user.decorator");
const user_role_enum_1 = require("../../core/auth/enums/user-role.enum");
let ContabilidadController = class ContabilidadController {
    contabilidadService;
    constructor(contabilidadService) {
        this.contabilidadService = contabilidadService;
    }
    async listAccounts(companyId) {
        return this.contabilidadService.findAllAccounts(companyId);
    }
    async createAccount(companyId, dto) {
        return this.contabilidadService.createAccount(companyId, dto);
    }
    async listPeriods(companyId) {
        return this.contabilidadService.findAllPeriods(companyId);
    }
    async createPeriod(companyId, dto) {
        return this.contabilidadService.createPeriod(companyId, {
            name: dto.name,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
        });
    }
    async closePeriod(companyId, id) {
        return this.contabilidadService.closePeriod(companyId, id);
    }
    async listEntries(companyId, from, to) {
        return this.contabilidadService.findAllJournalEntries(companyId, {
            fromDate: from ? new Date(from) : undefined,
            toDate: to ? new Date(to) : undefined,
        });
    }
    async createEntry(companyId, dto) {
        return this.contabilidadService.createJournalEntry(companyId, {
            entryDate: new Date(dto.entryDate),
            concept: dto.concept,
            lines: dto.lines,
        });
    }
    async postEntry(companyId, id) {
        return this.contabilidadService.postJournalEntry(companyId, id);
    }
    async trialBalance(companyId, from, to) {
        return this.contabilidadService.getTrialBalance(companyId, new Date(from), new Date(to));
    }
};
exports.ContabilidadController = ContabilidadController;
__decorate([
    (0, common_1.Get)('cuentas'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar plan de cuentas de la empresa' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContabilidadController.prototype, "listAccounts", null);
__decorate([
    (0, common_1.Post)('cuentas'),
    (0, roles_decorator_1.RequireRoles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.CONTADOR),
    (0, roles_decorator_1.RequirePermissions)('journal:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear cuenta contable' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContabilidadController.prototype, "createAccount", null);
__decorate([
    (0, common_1.Get)('periodos'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar períodos fiscales' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContabilidadController.prototype, "listPeriods", null);
__decorate([
    (0, common_1.Post)('periodos'),
    (0, roles_decorator_1.RequireRoles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.CONTADOR),
    (0, swagger_1.ApiOperation)({ summary: 'Crear período fiscal' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContabilidadController.prototype, "createPeriod", null);
__decorate([
    (0, common_1.Patch)('periodos/:id/cerrar'),
    (0, roles_decorator_1.RequireRoles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.CONTADOR),
    (0, roles_decorator_1.RequirePermissions)('journal:approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Cerrar un período fiscal' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContabilidadController.prototype, "closePeriod", null);
__decorate([
    (0, common_1.Get)('asientos'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar asientos contables' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ContabilidadController.prototype, "listEntries", null);
__decorate([
    (0, common_1.Post)('asientos'),
    (0, roles_decorator_1.RequireRoles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.CONTADOR),
    (0, roles_decorator_1.RequirePermissions)('journal:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear asiento contable (con validación de partida doble)' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContabilidadController.prototype, "createEntry", null);
__decorate([
    (0, common_1.Patch)('asientos/:id/contabilizar'),
    (0, roles_decorator_1.RequireRoles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.CONTADOR),
    (0, roles_decorator_1.RequirePermissions)('journal:approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Contabilizar (aprobar) un asiento — solo quienes no lo crearon (SoD)' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContabilidadController.prototype, "postEntry", null);
__decorate([
    (0, common_1.Get)('balance-comprobacion'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener Balance de Comprobación para un rango de fechas' }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ContabilidadController.prototype, "trialBalance", null);
exports.ContabilidadController = ContabilidadController = __decorate([
    (0, swagger_1.ApiTags)('Contabilidad'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, sod_guard_1.SegregationOfDutiesGuard),
    (0, common_1.Controller)('contabilidad'),
    __metadata("design:paramtypes", [contabilidad_service_1.ContabilidadService])
], ContabilidadController);
//# sourceMappingURL=contabilidad.controller.js.map