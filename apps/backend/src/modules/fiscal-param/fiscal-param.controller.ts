import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FiscalParamService } from './fiscal-param.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt.guard';
import { RequireRoles } from '../../core/auth/decorators/roles.decorator';
import { UserRole } from '../../core/auth/enums/user-role.enum';

@ApiTags('Parametrización Fiscal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fiscal-param')
export class FiscalParamController {
  constructor(private readonly fiscalParamService: FiscalParamService) {}

  @Get('tax-rate')
  @ApiOperation({ summary: 'Obtener tasa de impuesto vigente en una fecha' })
  async getTaxRate(
    @Query('taxType') taxType: string,
    @Query('date') dateStr: string,
  ) {
    const date = new Date(dateStr);
    const rate = await this.fiscalParamService.getTaxRate(taxType, date);
    return { taxType, date: dateStr, rate };
  }

  @Get('ut')
  @ApiOperation({ summary: 'Obtener Unidad Tributaria vigente en una fecha' })
  async getUnitTax(@Query('date') dateStr: string) {
    const date = new Date(dateStr);
    const value = await this.fiscalParamService.getUnitTaxValue(date);
    return { date: dateStr, unitTaxValue: value };
  }

  @Get('tax-rates')
  @ApiOperation({ summary: 'Listar todas las tasas de impuesto' })
  async listTaxRates() {
    return this.fiscalParamService.findAllTaxRates();
  }

  @Get('exchange-rates')
  @ApiOperation({ summary: 'Listar tasas de cambio BCV' })
  async listExchangeRates(@Query('currency') currency?: string) {
    return this.fiscalParamService.findAllExchangeRates(currency);
  }

  @Post('exchange-rates')
  @RequireRoles(UserRole.ADMIN, UserRole.CONTADOR)
  @ApiOperation({ summary: 'Registrar tasa de cambio BCV del día' })
  async createExchangeRate(
    @Body() body: { currencyCode: string; rate: number; date: string },
  ) {
    return this.fiscalParamService.createExchangeRate({
      currencyCode: body.currencyCode,
      rate: body.rate,
      date: new Date(body.date),
    });
  }
}
