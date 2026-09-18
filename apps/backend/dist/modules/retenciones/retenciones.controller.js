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
exports.RetencionesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const retenciones_service_1 = require("./retenciones.service");
const jwt_guard_1 = require("../../core/auth/guards/jwt.guard");
const current_user_decorator_1 = require("../../core/auth/decorators/current-user.decorator");
let RetencionesController = class RetencionesController {
    retencionesService;
    constructor(retencionesService) {
        this.retencionesService = retencionesService;
    }
    getIvaWithholdings(companyId) {
        return this.retencionesService.getIvaWithholdings(companyId);
    }
    createIvaWithholding(companyId, dto) {
        return this.retencionesService.createIvaWithholding(companyId, dto);
    }
    async exportarIvaTxt(companyId, year, month, res) {
        const y = parseInt(year) || new Date().getFullYear();
        const m = parseInt(month) || new Date().getMonth() + 1;
        const txt = await this.retencionesService.exportarIvaTxt(companyId, y, m);
        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Content-Disposition", `attachment; filename="retenciones_iva_${y}_${m}.txt"`);
        return res.send(txt);
    }
    getIslrConcepts(companyId) {
        return this.retencionesService.getIslrConcepts(companyId);
    }
    seedIslrConcepts(companyId) {
        return this.retencionesService.seedIslrConcepts(companyId);
    }
    getIslrWithholdings(companyId) {
        return this.retencionesService.getIslrWithholdings(companyId);
    }
    createIslrWithholding(companyId, dto) {
        return this.retencionesService.createIslrWithholding(companyId, dto);
    }
};
exports.RetencionesController = RetencionesController;
__decorate([
    (0, common_1.Get)("iva"),
    (0, swagger_1.ApiOperation)({ summary: "Listar Retenciones de IVA" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RetencionesController.prototype, "getIvaWithholdings", null);
__decorate([
    (0, common_1.Post)("iva"),
    (0, swagger_1.ApiOperation)({ summary: "Registrar Retención de IVA" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RetencionesController.prototype, "createIvaWithholding", null);
__decorate([
    (0, common_1.Get)("iva/exportar-txt"),
    (0, swagger_1.ApiOperation)({ summary: "Exportar TXT SENIAT Retenciones IVA" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Query)("year")),
    __param(2, (0, common_1.Query)("month")),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], RetencionesController.prototype, "exportarIvaTxt", null);
__decorate([
    (0, common_1.Get)("islr/conceptos"),
    (0, swagger_1.ApiOperation)({ summary: "Listar Conceptos ISLR" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RetencionesController.prototype, "getIslrConcepts", null);
__decorate([
    (0, common_1.Post)("islr/conceptos/seed"),
    (0, swagger_1.ApiOperation)({ summary: "Generar Conceptos ISLR por defecto" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RetencionesController.prototype, "seedIslrConcepts", null);
__decorate([
    (0, common_1.Get)("islr"),
    (0, swagger_1.ApiOperation)({ summary: "Listar Retenciones de ISLR" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RetencionesController.prototype, "getIslrWithholdings", null);
__decorate([
    (0, common_1.Post)("islr"),
    (0, swagger_1.ApiOperation)({ summary: "Registrar Retención de ISLR" }),
    __param(0, (0, current_user_decorator_1.CurrentCompany)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RetencionesController.prototype, "createIslrWithholding", null);
exports.RetencionesController = RetencionesController = __decorate([
    (0, swagger_1.ApiTags)("Retenciones"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("retenciones"),
    __metadata("design:paramtypes", [retenciones_service_1.RetencionesService])
], RetencionesController);
//# sourceMappingURL=retenciones.controller.js.map