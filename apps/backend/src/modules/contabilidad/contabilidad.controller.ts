import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ContabilidadService } from './contabilidad.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt.guard';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { SegregationOfDutiesGuard } from '../../core/auth/guards/sod.guard';
import { RequireRoles, RequirePermissions } from '../../core/auth/decorators/roles.decorator';
import { CurrentCompany } from '../../core/auth/decorators/current-user.decorator';
import { UserRole } from '../../core/auth/enums/user-role.enum';

@ApiTags('Contabilidad')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SegregationOfDutiesGuard)
@Controller('contabilidad')
export class ContabilidadController {
  constructor(private readonly contabilidadService: ContabilidadService) {}

  // ── Plan de Cuentas ─────────────────────────────────────────────
  @Get('cuentas')
  @ApiOperation({ summary: 'Listar plan de cuentas de la empresa' })
  async listAccounts(@CurrentCompany() companyId: string) {
    return this.contabilidadService.findAllAccounts(companyId);
  }

  @Post('cuentas')
  @RequireRoles(UserRole.ADMIN, UserRole.CONTADOR)
  @RequirePermissions('journal:create')
  @ApiOperation({ summary: 'Crear cuenta contable' })
  async createAccount(
    @CurrentCompany() companyId: string,
    @Body() dto: { code: string; name: string; type: string; parentId?: string; isControl?: boolean },
  ) {
    return this.contabilidadService.createAccount(companyId, dto);
  }

  // ── Períodos Fiscales ────────────────────────────────────────────
  @Get('periodos')
  @ApiOperation({ summary: 'Listar períodos fiscales' })
  async listPeriods(@CurrentCompany() companyId: string) {
    return this.contabilidadService.findAllPeriods(companyId);
  }

  @Post('periodos')
  @RequireRoles(UserRole.ADMIN, UserRole.CONTADOR)
  @ApiOperation({ summary: 'Crear período fiscal' })
  async createPeriod(
    @CurrentCompany() companyId: string,
    @Body() dto: { name: string; startDate: string; endDate: string },
  ) {
    return this.contabilidadService.createPeriod(companyId, {
      name: dto.name,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });
  }

  @Patch('periodos/:id/cerrar')
  @RequireRoles(UserRole.ADMIN, UserRole.CONTADOR)
  @RequirePermissions('journal:approve')
  @ApiOperation({ summary: 'Cerrar un período fiscal' })
  async closePeriod(@CurrentCompany() companyId: string, @Param('id') id: string) {
    return this.contabilidadService.closePeriod(companyId, id);
  }

  // ── Libro Diario ─────────────────────────────────────────────────
  @Get('asientos')
  @ApiOperation({ summary: 'Listar asientos contables' })
  async listEntries(
    @CurrentCompany() companyId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.contabilidadService.findAllJournalEntries(companyId, {
      fromDate: from ? new Date(from) : undefined,
      toDate: to ? new Date(to) : undefined,
    });
  }

  @Post('asientos')
  @RequireRoles(UserRole.ADMIN, UserRole.CONTADOR)
  @RequirePermissions('journal:create')
  @ApiOperation({ summary: 'Crear asiento contable (con validación de partida doble)' })
  async createEntry(
    @CurrentCompany() companyId: string,
    @Body() dto: {
      entryDate: string;
      concept: string;
      lines: Array<{ accountId: string; debit: number; credit: number; description?: string }>;
    },
  ) {
    return this.contabilidadService.createJournalEntry(companyId, {
      entryDate: new Date(dto.entryDate),
      concept: dto.concept,
      lines: dto.lines,
    });
  }

  @Patch('asientos/:id/contabilizar')
  @RequireRoles(UserRole.ADMIN, UserRole.CONTADOR)
  @RequirePermissions('journal:approve')
  @ApiOperation({ summary: 'Contabilizar (aprobar) un asiento — solo quienes no lo crearon (SoD)' })
  async postEntry(@CurrentCompany() companyId: string, @Param('id') id: string) {
    return this.contabilidadService.postJournalEntry(companyId, id);
  }

  // ── Balance de Comprobación ──────────────────────────────────────
  @Get('balance-comprobacion')
  @ApiOperation({ summary: 'Obtener Balance de Comprobación para un rango de fechas' })
  async trialBalance(
    @CurrentCompany() companyId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.contabilidadService.getTrialBalance(companyId, new Date(from), new Date(to));
  }
}
