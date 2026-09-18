import { Module } from "@nestjs/common";
import { CxcService } from "./cxc.service";
import { CxcController } from "./cxc.controller";
import { PrismaModule } from "../../core/database/prisma.module";
import { AuthModule } from "../../core/auth/auth.module";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CxcController],
  providers: [CxcService],
  exports: [CxcService],
})
export class CxcModule {}
