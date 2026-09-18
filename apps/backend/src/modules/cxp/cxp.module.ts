import { Module } from "@nestjs/common";
import { CxpService } from "./cxp.service";
import { CxpController } from "./cxp.controller";
import { PrismaModule } from "../../core/database/prisma.module";
import { AuthModule } from "../../core/auth/auth.module";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CxpController],
  providers: [CxpService],
  exports: [CxpService],
})
export class CxpModule {}
