import apiClient from './index';

export interface InventoryMovement {
  id: string;
  productId: string;
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT';
  concept: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  product?: { name: string; code: string; unitMeasure: string };
}

export interface ValuedProduct {
  id: string;
  code: string;
  name: string;
  stock: number;
  unitMeasure: string;
  unitPrice: number;
  averageCost?: number;
  lastCost?: number;
  costoPromedio: number;
  valorTotal: number;
}

export const inventarioApi = {
  getKardex: async (productId: string): Promise<InventoryMovement[]> => {
    const { data } = await apiClient.get<InventoryMovement[]>(`/inventario/kardex/${productId}`);
    return data;
  },

  getInventarioValorizado: async (): Promise<ValuedProduct[]> => {
    const { data } = await apiClient.get<ValuedProduct[]>('/inventario/valorizado');
    return data;
  },

  registrarAjuste: async (dto: { productId: string; adjustedStock: number; notes?: string }) => {
    const { data } = await apiClient.post('/inventario/ajustes', dto);
    return data;
  }
};
