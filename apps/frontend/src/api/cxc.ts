import apiClient from "./index";

export const cxcApi = {
  getPendingInvoices: async (customerId?: string) => {
    const { data } = await apiClient.get("/cxc/facturas-pendientes", { params: { customerId } });
    return data;
  },
  getPayments: async () => {
    const { data } = await apiClient.get("/cxc/pagos");
    return data;
  },
  registerPayment: async (dto: any) => {
    const { data } = await apiClient.post("/cxc/pagos", dto);
    return data;
  },
  getAging: async () => {
    const { data } = await apiClient.get("/cxc/aging");
    return data;
  }
};
