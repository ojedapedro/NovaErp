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
exports.NominaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nomina_service_1 = require("./nomina.service");
const jwt_guard_1 = require("../../core/auth/guards/jwt.guard");
const current_user_decorator_1 = require("../../core/auth/decorators/current-user.decorator");
const roles_guard_1 = require("../../core/auth/guards/roles.guard");
const roles_decorator_1 = require("../../core/auth/decorators/roles.decorator");
const user_role_enum_1 = require("../../core/auth/enums/user-role.enum");
let NominaController = class NominaController {
    nominaService;
    constructor(nominaService) {
        this.nominaService = nominaService;
    }
    getEmployees(companyId) {
        return this.nominaService.getEmployees(companyId);
    }
    createEmployee(companyId, dto) {
        return this.nominaService.createEmployee(companyId, dto);
    }
    getPeriods(companyId) {
        return this.nominaService.getPeriods(companyId);
    }
    createPeriod(companyId, dto) {
        return this.nominaService.createPeriod(companyId, dto);
    }
    calculatePayroll(companyId, id) {
        return this.nominaService.calculatePayroll(companyId, id);
    }
};
exports.NominaController = NominaController;
__decorate([
    (0, common_1.Get)("empleados"),
    (0, swagger_1.ApiOperation)({ summary: "Listar empleados" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NominaController.prototype, "getEmployees", null);
__decorate([
    (0, common_1.Post)("empleados"),
    (0, roles_decorator_1.RequireRoles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Registrar empleado" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NominaController.prototype, "createEmployee", null);
__decorate([
    (0, common_1.Get)("periodos"),
    (0, swagger_1.ApiOperation)({ summary: "Listar períodos de nómina" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NominaController.prototype, "getPeriods", null);
__decorate([
    (0, common_1.Post)("periodos"),
    (0, roles_decorator_1.RequireRoles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Crear período de nómina" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NominaController.prototype, "createPeriod", null);
__decorate([
    (0, common_1.Post)("periodos/:id/calcular"),
    (0, roles_decorator_1.RequireRoles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Calcular deducciones de nómina para el período" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], NominaController.prototype, "calculatePayroll", null);
exports.NominaController = NominaController = __decorate([
    (0, swagger_1.ApiTags)("Nomina"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)("nomina"),
    __metadata("design:paramtypes", [nomina_service_1.NominaService])
], NominaController);
//# sourceMappingURL=nomina.controller.js.map