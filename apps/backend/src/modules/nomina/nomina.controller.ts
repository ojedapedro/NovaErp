import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { NominaService } from "./nomina.service";
import { JwtAuthGuard } from "../../core/auth/guards/jwt.guard";
import { CurrentCompany } from "../../core/auth/decorators/current-user.decorator";
import { RolesGuard } from "../../core/auth/guards/roles.guard";
import { RequireRoles } from "../../core/auth/decorators/roles.decorator";
import { UserRole } from "../../core/auth/enums/user-role.enum";

@ApiTags("Nomina")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("nomina")
export class NominaController {
  constructor(private readonly nominaService: NominaService) {}

  @Get("empleados")
  @ApiOperation({ summary: "Listar empleados" })
  getEmployees(@CurrentCompany() companyId: string) {
    return this.nominaService.getEmployees(companyId);
  }

  @Post("empleados")
  @RequireRoles(UserRole.ADMIN)
  @ApiOperation({ summary: "Registrar empleado" })
  createEmployee(@CurrentCompany() companyId: string, @Body() dto: any) {
    return this.nominaService.createEmployee(companyId, dto);
  }

  @Get("periodos")
  @ApiOperation({ summary: "Listar períodos de nómina" })
  getPeriods(@CurrentCompany() companyId: string) {
    return this.nominaService.getPeriods(companyId);
  }

  @Post("periodos")
  @RequireRoles(UserRole.ADMIN)
  @ApiOperation({ summary: "Crear período de nómina" })
  createPeriod(@CurrentCompany() companyId: string, @Body() dto: any) {
    return this.nominaService.createPeriod(companyId, dto);
  }

  @Post("periodos/:id/calcular")
  @RequireRoles(UserRole.ADMIN)
  @ApiOperation({ summary: "Calcular deducciones de nómina para el período" })
  calculatePayroll(@CurrentCompany() companyId: string, @Param("id") id: string) {
    return this.nominaService.calculatePayroll(companyId, id);
  }
}
