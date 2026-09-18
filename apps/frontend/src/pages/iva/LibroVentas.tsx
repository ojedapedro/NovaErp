import React, { useState } from 'react';
import { Card, Typography, Table, Button, Select, Space, Tag } from 'antd';
import { DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { ivaApi, type LibroVentaLinea } from '../../api/iva';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export const LibroVentas: React.FC = () => {
  const [year, setYear] = useState<number>(dayjs().year());
  const [month, setMonth] = useState<number>(dayjs().month() + 1);

  const { data: libro, isLoading } = useQuery({
    queryKey: ['libro-ventas', year, month],
    queryFn: () => ivaApi.getLibroVentas(year, month),
  });

  const handleExportTxt = () => {
    ivaApi.downloadExportTxt(year, month);
  };

  const columns = [
    { title: 'N° Oper.', dataIndex: 'operacion', key: 'operacion', width: 80 },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', render: (val: string) => dayjs(val).format('DD/MM/YYYY') },
    { title: 'RIF', dataIndex: 'rif', key: 'rif' },
    { title: 'Razón Social', dataIndex: 'razonSocial', key: 'razonSocial', ellipsis: true },
    { title: 'N° Factura', dataIndex: 'numeroFactura', key: 'numeroFactura' },
    { title: 'N° Control', dataIndex: 'numeroControl', key: 'numeroControl' },
    { title: 'Base Imponible', dataIndex: 'baseImponible', key: 'baseImponible', align: 'right' as const, render: (v: number) => v.toFixed(2) },
    { title: '% Alic.', dataIndex: 'alicuota', key: 'alicuota', align: 'right' as const, render: (v: number) => `${v}%` },
    { title: 'Impuesto IVA', dataIndex: 'impuestoIva', key: 'impuestoIva', align: 'right' as const, render: (v: number) => v.toFixed(2) },
    { title: 'Total Ventas', dataIndex: 'totalVentasConIva', key: 'totalVentasConIva', align: 'right' as const, render: (v: number) => v.toFixed(2) },
    { title: 'IGTF (3%)', dataIndex: 'igtfPercibido', key: 'igtfPercibido', align: 'right' as const, render: (v: number) => v.toFixed(2) },
    { 
      title: 'Estado', 
      key: 'estado', 
      render: (_: any, r: LibroVentaLinea) => (
        <Tag color={r.estado === 'VOID' ? 'red' : 'green'}>{r.estado}</Tag>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Libro de Ventas</Title>
        <Space>
          <Select value={month} onChange={setMonth} style={{ width: 120 }}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <Option key={m} value={m}>{dayjs().month(m - 1).format('MMMM').toUpperCase()}</Option>
            ))}
          </Select>
          <Select value={year} onChange={setYear} style={{ width: 100 }}>
            {[2024, 2025, 2026, 2027].map(y => (
              <Option key={y} value={y}>{y}</Option>
            ))}
          </Select>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportTxt} disabled={!libro || libro.length === 0}>
            Exportar TXT (SENIAT)
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          dataSource={libro}
          columns={columns}
          rowKey="operacion"
          loading={isLoading}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>
    </div>
  );
};
