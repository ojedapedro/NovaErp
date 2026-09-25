import apiClient from "./index";
import { useAuthStore } from '../store/authStore';

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
  },
  closePeriod: async (periodId: string) => {
    const { data } = await apiClient.post(`/nomina/periodos/${periodId}/close`);
    return data;
  },
  downloadReceipt: (periodId: string, employeeId: string) => {
    const { token } = useAuthStore.getState();
    const url = `${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/nomina/periodos/${periodId}/recibo/${employeeId}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => {
        if (!r.ok) throw new Error(await r.text());
        return r.blob();
      })
      .then(blob => {
        const fileURL = window.URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      })
      .catch(e => console.error("Error al descargar Recibo de Nómina:", e));
  }
};
