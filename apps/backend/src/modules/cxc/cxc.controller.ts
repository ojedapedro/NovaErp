import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { CxcService } from "./cxc.service";
import { JwtAuthGuard } from "../../core/auth/guards/jwt.guard";
import { CurrentCompany } from "../../core/auth/decorators/current-user.decorator";

@ApiTags("Cuentas por Cobrar")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("cxc")
export class CxcController {
  constructor(private readonly cxcService: CxcService) {}

  @Get("facturas-pendientes")
  @ApiOperation({ summary: "Listar facturas pendientes de cobro" })
  getPendingInvoices(
    @CurrentCompany() companyId: string,
    @Query("customerId") customerId?: string
  ) {
    return this.cxcService.getPendingInvoices(companyId, customerId);
  }

  @Get("aging")
  @ApiOperation({ summary: "Obtener antigüedad de saldos (Aging) CxC" })
  getAging(@CurrentCompany() companyId: string) {
    return this.cxcService.getAging(companyId);
  }

  @Get("pagos")
  @ApiOperation({ summary: "Listar recibos de pago" })
  getPayments(@CurrentCompany() companyId: string) {
    return this.cxcService.getPayments(companyId);
  }

  @Post("pagos")
  @ApiOperation({ summary: "Registrar recibo de pago" })
  registerPayment(
    @CurrentCompany() companyId: string,
    @Body() dto: any
  ) {
    return this.cxcService.registerPayment(companyId, dto);
  }
}
