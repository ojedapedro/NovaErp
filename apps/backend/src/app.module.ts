import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

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
import { AlertsModule } from './modules/alerts/alerts.module';
import { ScheduleModule } from '@nestjs/schedule';

// App
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventarioModule } from './modules/inventario/inventario.module';

// Core Services
import { AccountingModule } from './core/accounting/accounting.module';
import { SequenceModule } from './core/sequences/sequence.module';

@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({ isGlobal: true }),

    // Throttler
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

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
    AccountingModule,
    SequenceModule,

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
    AlertsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
