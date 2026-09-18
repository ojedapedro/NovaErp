import apiClient from './index';
import { useAuthStore } from '../store/authStore';

export interface LibroVentaLinea {
  operacion: number;
  fecha: string;
  rif: string;
  razonSocial: string;
  numeroFactura: string;
  numeroControl: string;
  tipoDocumento: string;
  numeroFacturaAfectada?: string;
  totalVentasConIva: number;
  ventasNoGravadas: number;
  baseImponible: number;
  alicuota: number;
  impuestoIva: number;
  ivaRetenido: number;
  estado: string;
}

export const ivaApi = {
  getLibroVentas: async (year: number, month: number): Promise<LibroVentaLinea[]> => {
    const { data } = await apiClient.get<LibroVentaLinea[]>('/iva/libro-ventas', { params: { year, month } });
    return data;
  },
  downloadExportTxt: (year: number, month: number) => {
    const { token } = useAuthStore.getState();
    const url = `http://localhost:4000/api/iva/libro-ventas/exportar-txt?year=${year}&month=${month}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => {
        if (!r.ok) throw new Error(await r.text());
        return r.blob();
      })
      .then(blob => { const a = document.createElement('a'); a.href = window.URL.createObjectURL(blob); a.download = `libro_ventas_${year}_${month}.txt`; a.click(); })
      .catch(e => console.error("Error al descargar TXT Ventas:", e));
  },
  getLibroCompras: async (year: number, month: number): Promise<any[]> => {
    const { data } = await apiClient.get<any[]>('/iva/libro-compras', { params: { year, month } });
    return data;
  },
  downloadComprasExportTxt: (year: number, month: number) => {
    const { token } = useAuthStore.getState();
    const url = `http://localhost:4000/api/iva/libro-compras/exportar-txt?year=${year}&month=${month}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => {
        if (!r.ok) throw new Error(await r.text());
        return r.blob();
      })
      .then(blob => { const a = document.createElement('a'); a.href = window.URL.createObjectURL(blob); a.download = `libro_compras_${year}_${month}.txt`; a.click(); })
      .catch(e => console.error("Error al descargar TXT Compras:", e));
  },
};
