import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InventarioService } from './inventario.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt.guard';
import { CurrentCompany } from '../../core/auth/decorators/current-user.decorator';

@ApiTags('Inventario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Get('valorizado')
  @ApiOperation({ summary: 'Obtener inventario valorizado' })
  getInventarioValorizado(@CurrentCompany() companyId: string) {
    return this.inventarioService.getInventarioValorizado(companyId);
  }

  @Get('kardex/:productId')
  @ApiOperation({ summary: 'Obtener Kardex de un producto' })
  getKardex(
    @CurrentCompany() companyId: string,
    @Param('productId') productId: string
  ) {
    return this.inventarioService.getKardex(companyId, productId);
  }

  @Post('ajustes')
  @ApiOperation({ summary: 'Registrar toma física / ajuste de inventario' })
  registrarAjuste(
    @CurrentCompany() companyId: string,
    @Body() dto: any
  ) {
    return this.inventarioService.registrarAjuste(companyId, dto);
  }
}
