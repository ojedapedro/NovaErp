import { Module } from '@nestjs/common';
import { FiscalParamService } from './fiscal-param.service';
import { FiscalParamController } from './fiscal-param.controller';
import { PrismaModule } from '../../core/database/prisma.module';
import { AuthModule } from '../../core/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [FiscalParamController],
  providers: [FiscalParamService],
  exports: [FiscalParamService],
})
export class FiscalParamModule {}
