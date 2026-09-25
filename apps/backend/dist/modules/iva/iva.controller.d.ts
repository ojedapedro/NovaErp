import { Response } from "express";
import { IvaService } from "./iva.service";
import { ExcelService } from "./excel.service";
export declare class IvaController {
    private readonly ivaService;
    private readonly excelService;
    constructor(ivaService: IvaService, excelService: ExcelService);
    getLibroVentas(companyId: string, year: string, month: string): Promise<{
        operacion: number;
        fecha: string;
        rif: string;
        razonSocial: string;
        numeroFactura: string;
        numeroControl: string;
        tipoDocumento: string;
        totalVentasConIva: number;
        ventasNoGravadas: number;
        baseImponible: number;
        alicuota: number;
        impuestoIva: number;
        igtfPercibido: number;
        estado: string;
    }[]>;
    exportarVentasTxt(companyId: string, year: string, month: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getLibroCompras(companyId: string, year: string, month: string): Promise<{
        operacion: number;
        fecha: string;
        rif: string;
        razonSocial: string;
        numeroFactura: string;
        numeroControl: string;
        tipoDocumento: string;
        numeroComprobanteRetencion: string;
        totalComprasConIva: number;
        comprasExentas: number;
        baseImponible: number;
        alicuota: number;
        impuestoIva: number;
        ivaRetenido: number;
        estado: string;
    }[]>;
    exportarComprasTxt(companyId: string, year: string, month: string, res: Response): Promise<Response<any, Record<string, any>>>;
    exportarVentasExcel(companyId: string, year: string, month: string, res: Response): Promise<void>;
    exportarComprasExcel(companyId: string, year: string, month: string, res: Response): Promise<void>;
}
