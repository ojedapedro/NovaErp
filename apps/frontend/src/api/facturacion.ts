import apiClient from './index';
import { useAuthStore } from '../store/authStore';

export interface Customer {
  id: string;
  legalName: string;
  rif: string;
  address?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  code: string;
  barcode?: string;
  name: string;
  description?: string;
  unitPrice: number;
  unitMeasure: string;
  taxType: string;
  stock: number;
  isActive: boolean;
}

export interface InvoiceItem {
  id?: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  product?: { name: string; code: string };
}

export interface Invoice {
  id: string;
  number: number;
  invoiceDate: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  igtfAmount: number;
  total: number;
  currency: string;
  exchangeRate: number;
  notes?: string;
  customer?: { legalName: string; rif: string };
  items: InvoiceItem[];
}

export const facturacionApi = {
  // Clientes
  getCustomers: async (): Promise<Customer[]> => {
    const { data } = await apiClient.get<Customer[]>('/facturacion/clientes');
    return data;
  },
  createCustomer: async (dto: Omit<Customer, 'id' | 'isActive'>): Promise<Customer> => {
    const { data } = await apiClient.post<Customer>('/facturacion/clientes', dto);
    return data;
  },
  updateCustomer: async (id: string, dto: Partial<Customer>): Promise<Customer> => {
    const { data } = await apiClient.patch<Customer>(`/facturacion/clientes/${id}`, dto);
    return data;
  },

  // Productos
  getProducts: async (): Promise<Product[]> => {
    const { data } = await apiClient.get<Product[]>('/facturacion/productos');
    return data;
  },
  createProduct: async (dto: Omit<Product, 'id' | 'isActive'>): Promise<Product> => {
    const { data } = await apiClient.post<Product>('/facturacion/productos', dto);
    return data;
  },
  updateProduct: async (id: string, dto: Partial<Product>): Promise<Product> => {
    const { data } = await apiClient.patch<Product>(`/facturacion/productos/${id}`, dto);
    return data;
  },

  // Facturas
  getInvoices: async (params?: { status?: string; customerId?: string }): Promise<Invoice[]> => {
    const { data } = await apiClient.get<Invoice[]>('/facturacion/facturas', { params });
    return data;
  },
  createInvoice: async (dto: {
    customerId: string;
    invoiceDate: string;
    currency?: string;
    exchangeRate?: number;
    applyIgtf?: boolean;
    notes?: string;
    items: Array<{ productId: string; description?: string; quantity: number; unitPrice: number }>;
  }): Promise<Invoice> => {
    const { data } = await apiClient.post<Invoice>('/facturacion/facturas', dto);
    return data;
  },
  voidInvoice: async (id: string): Promise<Invoice> => {
    const { data } = await apiClient.patch<Invoice>(`/facturacion/facturas/${id}/anular`);
    return data;
  },
  downloadPdf: (id: string) => {
    const { token } = useAuthStore.getState();
    const url = `${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/facturacion/facturas/${id}/pdf`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.blob();
      })
      .then(blob => {
        const fileURL = window.URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      })
      .catch(e => console.error("Error al descargar PDF:", e));
  }
};
