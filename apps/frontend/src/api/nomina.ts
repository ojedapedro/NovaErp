import apiClient from "./index";

export const nominaApi = {
  getEmployees: async () => {
    const { data } = await apiClient.get("/nomina/empleados");
    return data;
  },
  createEmployee: async (dto: any) => {
    const { data } = await apiClient.post("/nomina/empleados", dto);
    return data;
  },
  getPeriods: async () => {
    const { data } = await apiClient.get("/nomina/periodos");
    return data;
  },
  createPeriod: async (dto: any) => {
    const { data } = await apiClient.post("/nomina/periodos", dto);
    return data;
  },
  calculatePayroll: async (periodId: string) => {
    const { data } = await apiClient.post(`/nomina/periodos/${periodId}/calcular`);
    return data;
  }
};
