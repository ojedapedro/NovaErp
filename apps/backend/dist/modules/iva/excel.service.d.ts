import { Response } from 'express';
export declare class ExcelService {
    exportVentasToExcel(data: any[], res: Response): Promise<void>;
    exportComprasToExcel(data: any[], res: Response): Promise<void>;
}
