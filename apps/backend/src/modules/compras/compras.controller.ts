import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ComprasService } from './compras.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt.guard';
import { CurrentCompany } from '../../core/auth/decorators/current-user.decorator';

@ApiTags('Compras')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Get('proveedores')
  @ApiOperation({ summary: 'Listar Proveedores' })
  getSuppliers(@CurrentCompany() companyId: string) {
    return this.comprasService.getSuppliers(companyId);
  }

  @Post('proveedores')
  @ApiOperation({ summary: 'Crear Proveedor' })
  createSupplier(@CurrentCompany() companyId: string, @Body() dto: any) {
    return this.comprasService.createSupplier(companyId, dto);
  }

  @Patch('proveedores/:id')
  @ApiOperation({ summary: 'Actualizar Proveedor' })
  updateSupplier(@CurrentCompany() companyId: string, @Param('id') id: string, @Body() dto: any) {
    return this.comprasService.updateSupplier(companyId, id, dto);
  }

  @Get('facturas')
  @ApiOperation({ summary: 'Listar Facturas de Compra' })
  getPurchaseInvoices(@CurrentCompany() companyId: string) {
    return this.comprasService.getPurchaseInvoices(companyId);
  }

  @Post('facturas')
  @ApiOperation({ summary: 'Crear Factura de Compra' })
  createPurchaseInvoice(@CurrentCompany() companyId: string, @Body() dto: any) {
    return this.comprasService.createPurchaseInvoice(companyId, dto);
  }
}
