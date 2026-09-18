"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NominaModule = void 0;
const common_1 = require("@nestjs/common");
const nomina_service_1 = require("./nomina.service");
const nomina_controller_1 = require("./nomina.controller");
const prisma_module_1 = require("../../core/database/prisma.module");
const auth_module_1 = require("../../core/auth/auth.module");
let NominaModule = class NominaModule {
};
exports.NominaModule = NominaModule;
exports.NominaModule = NominaModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, auth_module_1.AuthModule],
        controllers: [nomina_controller_1.NominaController],
        providers: [nomina_service_1.NominaService],
    })
], NominaModule);
//# sourceMappingURL=nomina.module.js.map