import api from './axios';

export interface FiscalParam {
  id: string;
  taxType: string;
  rate: number;
  validFrom: string;
  validTo?: string;
}

export const fiscalParamApi = {
  getFiscalParams: async (): Promise<FiscalParam[]> => {
    const res = await api.get('/fiscal-param/tax-rates');
    return res.data;
  },
  
  createFiscalParam: async (dto: { taxType: string; rate: number; validFrom: string; validTo?: string }): Promise<FiscalParam> => {
    const res = await api.post('/fiscal-param/tax-rates', dto);
    return res.data;
  }
};
