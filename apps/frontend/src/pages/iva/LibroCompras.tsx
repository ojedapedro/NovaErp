import React, { useState } from "react";
import { Card, Typography, Table, Button, Select, Space, Tag, DatePicker } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { ivaApi, type LibroVentaLinea } from "../../api/iva";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

export interface LibroCompraLinea extends LibroVentaLinea {
  comprasExentas: number;
  ivaRetenido: number;
  numeroComprobanteRetencion: string;
}

export const LibroCompras: React.FC = () => {
  const [year, setYear] = useState<number>(dayjs().year());
  const [month, setMonth] = useState<number>(dayjs().month() + 1);

  const { data: libro, isLoading } = useQuery({
    queryKey: ["libro-compras", year, month],
    queryFn: () => ivaApi.getLibroCompras(year, month),
  });

  const handleExportTxt = () => {
    ivaApi.downloadComprasExportTxt(year, month);
  };

  const handleExportExcel = () => {
    ivaApi.downloadComprasExcel(year, month);
  };

  const columns = [
    { title: "N Oper.", dataIndex: "operacion", key: "operacion", width: 70 },
    { title: "Fecha", dataIndex: "fecha", key: "fecha", render: (v: string) => dayjs(v).format("DD/MM/YYYY") },
    { title: "RIF", dataIndex: "rif", key: "rif" },
    { title: "Razon Social", dataIndex: "razonSocial", key: "razonSocial", ellipsis: true },
    { title: "N Factura", dataIndex: "numeroFactura", key: "numeroFactura" },
    { title: "N Control", dataIndex: "numeroControl", key: "numeroControl" },
    { title: "Base Imponible", dataIndex: "baseImponible", key: "baseImponible", align: "right" as const, render: (v: number) => Number(v).toFixed(2) },
    { title: "% Alic.", dataIndex: "alicuota", key: "alicuota", align: "right" as const, render: (v: number) => v + "%" },
    { title: "IVA", dataIndex: "impuestoIva", key: "impuestoIva", align: "right" as const, render: (v: number) => Number(v).toFixed(2) },
    { title: "IVA Retenido", dataIndex: "ivaRetenido", key: "ivaRetenido", align: "right" as const, render: (v: number) => Number(v).toFixed(2) },
    { title: "Total", dataIndex: "totalComprasConIva", key: "totalComprasConIva", align: "right" as const, render: (v: number) => Number(v).toFixed(2) },
    {
      title: "Estado",
      key: "estado",
      render: (_: any, r: any) => <Tag color={r.estado === "VOID" ? "red" : "green"}>{r.estado}</Tag>,
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Libro de Compras</Title>
        <Space>
          <DatePicker 
            picker="month" 
            value={dayjs().year(year).month(month - 1)} 
            onChange={(date) => {
              if (date) {
                setYear(date.year());
                setMonth(date.month() + 1);
              }
            }} 
            allowClear={false}
          />
          <Button type="default" onClick={handleExportExcel} disabled={!libro || libro.length === 0}>
            Exportar Excel
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportTxt} disabled={!libro || libro.length === 0}>
            Exportar TXT (SENIAT)
          </Button>
        </Space>
      </div>
      <Card>
        <Table dataSource={libro} columns={columns} rowKey="operacion" loading={isLoading} scroll={{ x: 1100 }} size="small" />
      </Card>
    </div>
  );
};
