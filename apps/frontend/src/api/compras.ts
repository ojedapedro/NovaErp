import apiClient from "./index";

export interface Supplier {
  id: string;
  legalName: string;
  rif: string;
  address?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
}

export interface PurchaseInvoice {
  id: string;
  supplierId: string;
  supplier?: Supplier;
  invoiceNumber: string;
  controlNumber: string;
  invoiceDate: string;
  status: string;
  subtotal: number;
  exemptAmount: number;
  taxAmount: number;
  total: number;
  currency: string;
  exchangeRate: number;
  notes?: string;
  ivaWithheldAmount?: number;
  ivaWithholdingNumber?: string;
  items?: PurchaseInvoiceItem[];
}

export interface PurchaseInvoiceItem {
  id: string;
  productId?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export const comprasApi = {
  getSuppliers: async (): Promise<Supplier[]> => {
    const { data } = await apiClient.get<Supplier[]>("/compras/proveedores");
    return data;
  },
  createSupplier: async (dto: Partial<Supplier>): Promise<Supplier> => {
    const { data } = await apiClient.post<Supplier>("/compras/proveedores", dto);
    return data;
  },
  updateSupplier: async (id: string, dto: Partial<Supplier>): Promise<Supplier> => {
    const { data } = await apiClient.patch<Supplier>(`/compras/proveedores/${id}`, dto);
    return data;
  },
  getPurchaseInvoices: async (): Promise<PurchaseInvoice[]> => {
    const { data } = await apiClient.get<PurchaseInvoice[]>("/compras/facturas");
    return data;
  },
  createPurchaseInvoice: async (dto: any): Promise<PurchaseInvoice> => {
    const { data } = await apiClient.post<PurchaseInvoice>("/compras/facturas", dto);
    return data;
  },
};
