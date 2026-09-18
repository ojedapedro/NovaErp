import { Module } from '@nestjs/common';
import { IvaService } from './iva.service';
import { IvaController } from './iva.controller';

import { PrismaModule } from '../../core/database/prisma.module';
import { AuthModule } from '../../core/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [IvaController],
  providers: [IvaService],
  exports: [IvaService],
})
export class IvaModule {}
