import { PrismaService } from "../../core/database/prisma.service";
export declare class IvaService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getLibroVentas(companyId: string, year: number, month: number): Promise<{
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
    exportarTxtSeniat(companyId: string, year: number, month: number): Promise<string>;
    getLibroCompras(companyId: string, year: number, month: number): Promise<{
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
    exportarComprasTxtSeniat(companyId: string, year: number, month: number): Promise<string>;
}
