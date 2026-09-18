import { Controller, Get, Post, Body, Param, Query, UseGuards, Res } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { Response } from "express";
import { RetencionesService } from "./retenciones.service";
import { JwtAuthGuard } from "../../core/auth/guards/jwt.guard";
import { CurrentCompany } from "../../core/auth/decorators/current-user.decorator";

@ApiTags("Retenciones")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("retenciones")
export class RetencionesController {
  constructor(private readonly retencionesService: RetencionesService) {}

  // ================= IVA =================
  @Get("iva")
  @ApiOperation({ summary: "Listar Retenciones de IVA" })
  getIvaWithholdings(@CurrentCompany() companyId: string) {
    return this.retencionesService.getIvaWithholdings(companyId);
  }

  @Post("iva")
  @ApiOperation({ summary: "Registrar Retención de IVA" })
  createIvaWithholding(@CurrentCompany() companyId: string, @Body() dto: any) {
    return this.retencionesService.createIvaWithholding(companyId, dto);
  }

  @Get("iva/exportar-txt")
  @ApiOperation({ summary: "Exportar TXT SENIAT Retenciones IVA" })
  async exportarIvaTxt(
    @CurrentCompany() companyId: string,
    @Query("year") year: string,
    @Query("month") month: string,
    @Res() res: Response,
  ) {
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;
    const txt = await this.retencionesService.exportarIvaTxt(companyId, y, m);
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename="retenciones_iva_${y}_${m}.txt"`);
    return res.send(txt);
  }

  // ================= ISLR CONCEPTOS =================
  @Get("islr/conceptos")
  @ApiOperation({ summary: "Listar Conceptos ISLR" })
  getIslrConcepts(@CurrentCompany() companyId: string) {
    return this.retencionesService.getIslrConcepts(companyId);
  }

  @Post("islr/conceptos/seed")
  @ApiOperation({ summary: "Generar Conceptos ISLR por defecto" })
  seedIslrConcepts(@CurrentCompany() companyId: string) {
    return this.retencionesService.seedIslrConcepts(companyId);
  }

  // ================= ISLR RETENCIONES =================
  @Get("islr")
  @ApiOperation({ summary: "Listar Retenciones de ISLR" })
  getIslrWithholdings(@CurrentCompany() companyId: string) {
    return this.retencionesService.getIslrWithholdings(companyId);
  }

  @Post("islr")
  @ApiOperation({ summary: "Registrar Retención de ISLR" })
  createIslrWithholding(@CurrentCompany() companyId: string, @Body() dto: any) {
    return this.retencionesService.createIslrWithholding(companyId, dto);
  }
}
