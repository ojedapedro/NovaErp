import { Controller, Get, Query, UseGuards, Res } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { Response } from "express";
import { IvaService } from "./iva.service";
import { JwtAuthGuard } from "../../core/auth/guards/jwt.guard";
import { CurrentCompany } from "../../core/auth/decorators/current-user.decorator";

@ApiTags("Impuestos e IVA")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("iva")
export class IvaController {
  constructor(private readonly ivaService: IvaService) {}

  @Get("libro-ventas")
  @ApiOperation({ summary: "Obtener Libro de Ventas" })
  async getLibroVentas(
    @CurrentCompany() companyId: string,
    @Query("year") year: string,
    @Query("month") month: string,
  ) {
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;
    return this.ivaService.getLibroVentas(companyId, y, m);
  }

  @Get("libro-ventas/exportar-txt")
  @ApiOperation({ summary: "Exportar TXT SENIAT Libro de Ventas" })
  async exportarVentasTxt(
    @CurrentCompany() companyId: string,
    @Query("year") year: string,
    @Query("month") month: string,
    @Res() res: Response,
  ) {
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;
    const txt = await this.ivaService.exportarTxtSeniat(companyId, y, m);
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename="ventas_${y}_${m}.txt"`);
    return res.send(txt);
  }

  @Get("libro-compras")
  @ApiOperation({ summary: "Obtener Libro de Compras" })
  async getLibroCompras(
    @CurrentCompany() companyId: string,
    @Query("year") year: string,
    @Query("month") month: string,
  ) {
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;
    return this.ivaService.getLibroCompras(companyId, y, m);
  }

  @Get("libro-compras/exportar-txt")
  @ApiOperation({ summary: "Exportar TXT SENIAT Libro de Compras" })
  async exportarComprasTxt(
    @CurrentCompany() companyId: string,
    @Query("year") year: string,
    @Query("month") month: string,
    @Res() res: Response,
  ) {
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;
    const txt = await this.ivaService.exportarComprasTxtSeniat(companyId, y, m);
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename="compras_${y}_${m}.txt"`);
    return res.send(txt);
  }
}
