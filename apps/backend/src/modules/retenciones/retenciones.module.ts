import { Module } from "@nestjs/common";
import { RetencionesService } from "./retenciones.service";
import { RetencionesController } from "./retenciones.controller";
import { PrismaModule } from "../../core/database/prisma.module";
import { AuthModule } from "../../core/auth/auth.module";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RetencionesController],
  providers: [RetencionesService],
  exports: [RetencionesService],
})
export class RetencionesModule {}
