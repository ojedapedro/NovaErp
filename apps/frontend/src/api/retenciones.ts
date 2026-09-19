import apiClient from "./index";
import { useAuthStore } from "../store/authStore";

export const retencionesApi = {
  // IVA
  getIvaWithholdings: async () => {
    const { data } = await apiClient.get("/retenciones/iva");
    return data;
  },
  createIvaWithholding: async (dto: any) => {
    const { data } = await apiClient.post("/retenciones/iva", dto);
    return data;
  },
  downloadIvaTxt: (year: number, month: number) => {
    const { token } = useAuthStore.getState();
    const url = `${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/retenciones/iva/exportar-txt?year=${year}&month=${month}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = `retenciones_iva_${year}_${month}.txt`;
        a.click();
      })
      .catch(e => console.error("Error al descargar TXT IVA:", e));
  },

  // ISLR
  getIslrConcepts: async () => {
    const { data } = await apiClient.get("/retenciones/islr/conceptos");
    return data;
  },
  seedIslrConcepts: async () => {
    const { data } = await apiClient.post("/retenciones/islr/conceptos/seed", {});
    return data;
  },
  getIslrWithholdings: async () => {
    const { data } = await apiClient.get("/retenciones/islr");
    return data;
  },
  createIslrWithholding: async (dto: any) => {
    const { data } = await apiClient.post("/retenciones/islr", dto);
    return data;
  },
};
