import React from 'react';
import { Table, Button, Card, Typography, Space, Tag } from 'antd';
import { PlusOutlined, EyeOutlined, PrinterOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { facturacionApi, type Invoice } from '../../api/facturacion';
import dayjs from 'dayjs';

const { Title } = Typography;

export const Facturas: React.FC = () => {
  const navigate = useNavigate();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => facturacionApi.getInvoices(),
  });

  const columns = [
    { 
      title: 'Número', 
      dataIndex: 'number', 
      key: 'number',
      render: (val: number) => `#${String(val).padStart(6, '0')}`
    },
    { 
      title: 'Fecha', 
      dataIndex: 'invoiceDate', 
      key: 'invoiceDate',
      render: (val: string) => dayjs(val).format('DD/MM/YYYY')
    },
    { 
      title: 'Cliente', 
      key: 'customer',
      render: (_: any, record: Invoice) => record.customer?.legalName
    },
    { 
      title: 'Total', 
      dataIndex: 'total', 
      key: 'total',
      align: 'right' as const,
      render: (val: number, record: Invoice) => `${record.currency} ${Number(val).toFixed(2)}`
    },
    { 
      title: 'Estado', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        const color = status === 'ISSUED' ? 'green' : status === 'VOID' ? 'red' : 'default';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Invoice) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} />
          <Button type="text" icon={<PrinterOutlined />} onClick={() => facturacionApi.downloadPdf(record.id)} title="Ver PDF" />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Facturas de Venta</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/facturacion/facturas/nueva')}>
          Emitir Factura
        </Button>
      </div>

      <Card>
        <Table
          dataSource={invoices}
          columns={columns}
          rowKey="id"
          loading={isLoading}
        />
      </Card>
    </div>
  );
};
