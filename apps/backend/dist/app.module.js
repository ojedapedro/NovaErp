"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_cls_1 = require("nestjs-cls");
const prisma_module_1 = require("./core/database/prisma.module");
const auth_module_1 = require("./core/auth/auth.module");
const fiscal_param_module_1 = require("./modules/fiscal-param/fiscal-param.module");
const contabilidad_module_1 = require("./modules/contabilidad/contabilidad.module");
const facturacion_module_1 = require("./modules/facturacion/facturacion.module");
const iva_module_1 = require("./modules/iva/iva.module");
const compras_module_1 = require("./modules/compras/compras.module");
const retenciones_module_1 = require("./modules/retenciones/retenciones.module");
const cxc_module_1 = require("./modules/cxc/cxc.module");
const cxp_module_1 = require("./modules/cxp/cxp.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const nomina_module_1 = require("./modules/nomina/nomina.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const inventario_module_1 = require("./modules/inventario/inventario.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            nestjs_cls_1.ClsModule.forRoot({
                global: true,
                middleware: {
                    mount: true,
                    setup: (cls, req) => {
                        cls.set('ipAddress', req.ip ?? req.headers['x-forwarded-for'] ?? 'unknown');
                    },
                },
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            fiscal_param_module_1.FiscalParamModule,
            contabilidad_module_1.ContabilidadModule,
            facturacion_module_1.FacturacionModule,
            iva_module_1.IvaModule,
            compras_module_1.ComprasModule,
            retenciones_module_1.RetencionesModule,
            cxc_module_1.CxcModule,
            cxp_module_1.CxpModule,
            dashboard_module_1.DashboardModule,
            nomina_module_1.NominaModule,
            inventario_module_1.InventarioModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map