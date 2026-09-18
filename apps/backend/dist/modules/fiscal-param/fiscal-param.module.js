"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiscalParamModule = void 0;
const common_1 = require("@nestjs/common");
const fiscal_param_service_1 = require("./fiscal-param.service");
const fiscal_param_controller_1 = require("./fiscal-param.controller");
const prisma_module_1 = require("../../core/database/prisma.module");
const auth_module_1 = require("../../core/auth/auth.module");
let FiscalParamModule = class FiscalParamModule {
};
exports.FiscalParamModule = FiscalParamModule;
exports.FiscalParamModule = FiscalParamModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, auth_module_1.AuthModule],
        controllers: [fiscal_param_controller_1.FiscalParamController],
        providers: [fiscal_param_service_1.FiscalParamService],
        exports: [fiscal_param_service_1.FiscalParamService],
    })
], FiscalParamModule);
//# sourceMappingURL=fiscal-param.module.js.map