import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';

// Core
import { PrismaModule } from './core/database/prisma.module';
import { AuthModule } from './core/auth/auth.module';

// Domain Modules
import { FiscalParamModule } from './modules/fiscal-param/fiscal-param.module';
import { ContabilidadModule } from './modules/contabilidad/contabilidad.module';
import { FacturacionModule } from './modules/facturacion/facturacion.module';
import { IvaModule } from './modules/iva/iva.module';
import { ComprasModule } from './modules/compras/compras.module';
import { RetencionesModule } from './modules/retenciones/retenciones.module';
import { CxcModule } from './modules/cxc/cxc.module';
import { CxpModule } from './modules/cxp/cxp.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NominaModule } from './modules/nomina/nomina.module';

// App
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventarioModule } from './modules/inventario/inventario.module';

@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({ isGlobal: true }),

    // nestjs-cls: almacena companyId, userId e ipAddress por request
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req) => {
          cls.set('ipAddress', req.ip ?? req.headers['x-forwarded-for'] ?? 'unknown');
        },
      },
    }),

    // Infraestructura
    PrismaModule,
    AuthModule,

    // Módulos de dominio - Fase 1 & 3
    FiscalParamModule,
    ContabilidadModule,
    FacturacionModule,
    IvaModule,
    ComprasModule,
    RetencionesModule,
    CxcModule,
    CxpModule,
    DashboardModule,
    NominaModule,
    InventarioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
