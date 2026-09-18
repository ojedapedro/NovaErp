import { Module } from "@nestjs/common";
import { NominaService } from "./nomina.service";
import { NominaController } from "./nomina.controller";
import { PrismaModule } from "../../core/database/prisma.module";
import { AuthModule } from "../../core/auth/auth.module";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [NominaController],
  providers: [NominaService],
})
export class NominaModule {}
