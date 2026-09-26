import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { FacturacionService } from './facturacion.service';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt.guard';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { SegregationOfDutiesGuard } from '../../core/auth/guards/sod.guard';
import { RequireRoles } from '../../core/auth/decorators/roles.decorator';
import { CurrentCompany } from '../../core/auth/decorators/current-user.decorator';
import { UserRole } from '../../core/auth/enums/user-role.enum';

@ApiTags('Facturacion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SegregationOfDutiesGuard)
@Controller('facturacion')
export class FacturacionController {
  constructor(
    private readonly facturacionService: FacturacionService,
    private readonly pdfService: PdfService
  ) {}

  // ================= Clientes =================
  @Get('clientes')
  @ApiOperation({ summary: 'Listar clientes' })
  async listCustomers(@CurrentCompany() companyId: string) {
    return this.facturacionService.findAllCustomers(companyId);
  }

  @Post('clientes')
  @RequireRoles(UserRole.ADMIN, UserRole.CAJERO)
  @ApiOperation({ summary: 'Crear cliente' })
  async createCustomer(
    @CurrentCompany() companyId: string,
    @Body() dto: { legalName: string; rif: string; address?: string; email?: string; phone?: string },
  ) {
    return this.facturacionService.createCustomer(companyId, dto);
  }

  @Patch('clientes/:id')
  @RequireRoles(UserRole.ADMIN, UserRole.CAJERO)
  @ApiOperation({ summary: 'Actualizar cliente' })
  async updateCustomer(
    @CurrentCompany() companyId: string,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.facturacionService.updateCustomer(companyId, id, dto);
  }

  // ================= Productos =================
  @Get('productos')
  @ApiOperation({ summary: 'Listar productos/servicios' })
  async listProducts(@CurrentCompany() companyId: string) {
    return this.facturacionService.findAllProducts(companyId);
  }

  @Post('productos')
  @RequireRoles(UserRole.ADMIN, UserRole.CONTADOR)
  @ApiOperation({ summary: 'Crear producto/servicio' })
  async createProduct(
    @CurrentCompany() companyId: string,
    @Body() dto: { code?: string; barcode?: string; name: string; description?: string; unitPrice: number; unitMeasure?: string; taxType?: string },
  ) {
    return this.facturacionService.createProduct(companyId, dto);
  }

  @Patch('productos/:id')
  @RequireRoles(UserRole.ADMIN, UserRole.CONTADOR)
  @ApiOperation({ summary: 'Actualizar producto' })
  async updateProduct(
    @CurrentCompany() companyId: string,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.facturacionService.updateProduct(companyId, id, dto);
  }

  // ================= Facturas =================
  @Get('facturas')
  @ApiOperation({ summary: 'Listar facturas' })
  async listInvoices(
    @CurrentCompany() companyId: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.facturacionService.findAllInvoices(companyId, { status, customerId });
  }

  @Post('facturas')
  @RequireRoles(UserRole.ADMIN, UserRole.CAJERO)
  @ApiOperation({ summary: 'Emitir factura' })
  async createInvoice(
    @CurrentCompany() companyId: string,
    @Body() dto: {
      customerId: string;
      invoiceDate: string;
      currency?: string;
      exchangeRate?: number;
      applyIgtf?: boolean;
      notes?: string;
      items: Array<{ productId: string; description?: string; quantity: number; unitPrice: number }>;
    },
  ) {
    return this.facturacionService.createInvoice(companyId, dto);
  }

  @Patch('facturas/:id/anular')
  @RequireRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Anular factura' })
  async voidInvoice(@CurrentCompany() companyId: string, @Param('id') id: string) {
    return this.facturacionService.voidInvoice(companyId, id);
  }

  @Get('facturas/:id/pdf')
  @ApiOperation({ summary: 'Descargar Factura PDF (Providencia 0102)' })
  async downloadInvoicePdf(
    @CurrentCompany() companyId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="factura_${id}.pdf"`);
    
    // El PdfService escribirá directamente en el stream de respuesta
    await this.pdfService.generateInvoicePdf(id, companyId, res);
  }
}
