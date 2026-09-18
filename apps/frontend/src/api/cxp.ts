import apiClient from "./index";

export const cxpApi = {
  getPendingInvoices: async (supplierId?: string) => {
    const { data } = await apiClient.get("/cxp/facturas-pendientes", { params: { supplierId } });
    return data;
  },
  getPayments: async () => {
    const { data } = await apiClient.get("/cxp/pagos");
    return data;
  },
  registerPayment: async (dto: any) => {
    const { data } = await apiClient.post("/cxp/pagos", dto);
    return data;
  },
};
