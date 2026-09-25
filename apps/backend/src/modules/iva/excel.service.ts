import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class ExcelService {
  async exportVentasToExcel(data: any[], res: Response) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Libro de Ventas');
    
    sheet.columns = [
      { header: 'Operación', key: 'operacion', width: 10 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'RIF', key: 'rif', width: 15 },
      { header: 'Razón Social', key: 'razonSocial', width: 35 },
      { header: 'N° Factura', key: 'numeroFactura', width: 15 },
      { header: 'N° Control', key: 'numeroControl', width: 15 },
      { header: 'Tipo Doc', key: 'tipoDocumento', width: 10 },
      { header: 'Fact Afectada', key: 'numeroFacturaAfectada', width: 15 },
      { header: 'Total c/IVA', key: 'totalVentasConIva', width: 15 },
      { header: 'Ventas No Gravadas', key: 'ventasNoGravadas', width: 18 },
      { header: 'Base Imponible', key: 'baseImponible', width: 15 },
      { header: '% IVA', key: 'alicuota', width: 10 },
      { header: 'Impuesto IVA', key: 'impuestoIva', width: 15 },
      { header: 'IVA Retenido', key: 'ivaRetenido', width: 15 }
    ];

    sheet.addRows(data);

    // Formato de tabla básico
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: 'center' };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=libro_ventas.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  }

  async exportComprasToExcel(data: any[], res: Response) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Libro de Compras');
    
    sheet.columns = [
      { header: 'Operación', key: 'operacion', width: 10 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'RIF', key: 'rif', width: 15 },
      { header: 'Razón Social', key: 'razonSocial', width: 35 },
      { header: 'N° Factura', key: 'numeroFactura', width: 15 },
      { header: 'N° Control', key: 'numeroControl', width: 15 },
      { header: 'Tipo Doc', key: 'tipoDocumento', width: 10 },
      { header: 'Total c/IVA', key: 'totalComprasConIva', width: 15 },
      { header: 'Compras No Gravadas', key: 'comprasNoGravadas', width: 18 },
      { header: 'Base Imponible', key: 'baseImponible', width: 15 },
      { header: '% IVA', key: 'alicuota', width: 10 },
      { header: 'Impuesto IVA', key: 'impuestoIva', width: 15 },
      { header: 'IVA Retenido', key: 'ivaRetenido', width: 15 }
    ];

    sheet.addRows(data);
    sheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=libro_compras.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  }
}
