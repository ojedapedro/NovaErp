import { Module } from '@nestjs/common';
import { FacturacionService } from './facturacion.service';
import { FacturacionController } from './facturacion.controller';
import { PrismaModule } from '../../core/database/prisma.module';
import { AuthModule } from '../../core/auth/auth.module';
import { PdfService } from './pdf.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [FacturacionController],
  providers: [FacturacionService, PdfService],
  exports: [FacturacionService],
})
export class FacturacionModule {}
