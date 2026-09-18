import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { CxpService } from "./cxp.service";
import { JwtAuthGuard } from "../../core/auth/guards/jwt.guard";
import { CurrentCompany } from "../../core/auth/decorators/current-user.decorator";

@ApiTags("Cuentas por Pagar")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("cxp")
export class CxpController {
  constructor(private readonly cxpService: CxpService) {}

  @Get("facturas-pendientes")
  @ApiOperation({ summary: "Listar facturas pendientes de pago a proveedores" })
  getPendingInvoices(
    @CurrentCompany() companyId: string,
    @Query("supplierId") supplierId?: string
  ) {
    return this.cxpService.getPendingInvoices(companyId, supplierId);
  }

  @Get("pagos")
  @ApiOperation({ summary: "Listar egresos / pagos a proveedores" })
  getPayments(@CurrentCompany() companyId: string) {
    return this.cxpService.getPayments(companyId);
  }

  @Post("pagos")
  @ApiOperation({ summary: "Registrar pago a proveedor" })
  registerPayment(
    @CurrentCompany() companyId: string,
    @Body() dto: any
  ) {
    return this.cxpService.registerPayment(companyId, dto);
  }
}
