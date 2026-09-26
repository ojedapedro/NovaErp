import { Controller, Get, Post, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AlertsService } from "./alerts.service";
import { JwtAuthGuard } from "../../core/auth/guards/jwt.guard";
import { CurrentCompany } from "../../core/auth/decorators/current-user.decorator";

@ApiTags("Alertas")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("alerts")
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get("unread")
  @ApiOperation({ summary: "Obtener alertas no leídas" })
  getUnread(@CurrentCompany() companyId: string) {
    return this.alertsService.getUnreadAlerts(companyId);
  }

  @Post(":id/read")
  @ApiOperation({ summary: "Marcar alerta como leída" })
  markAsRead(@CurrentCompany() companyId: string, @Param("id") alertId: string) {
    return this.alertsService.markAsRead(companyId, alertId);
  }
}
