import { Response } from "express";
import { IvaService } from "./iva.service";
export declare class IvaController {
    private readonly ivaService;
    constructor(ivaService: IvaService);
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
}
