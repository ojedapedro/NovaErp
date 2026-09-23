import React, { useState } from 'react';
import { Table, Typography, Card, Select, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { inventarioApi, type InventoryMovement } from '../../api/inventario';
import { facturacionApi } from '../../api/facturacion';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export const Kardex: React.FC = () => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: facturacionApi.getProducts,
  });

  const { data: movements, isLoading } = useQuery({
    queryKey: ['kardex', selectedProductId],
    queryFn: () => inventarioApi.getKardex(selectedProductId!),
    enabled: !!selectedProductId,
  });

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Concepto',
      dataIndex: 'concept',
      key: 'concept',
      render: (v: string, r: InventoryMovement) => (
        <>
          <Text strong>{v}</Text>
          {r.referenceNumber && <div>Ref: {r.referenceNumber}</div>}
        </>
      ),
    },
    {
      title: 'Tipo',
      dataIndex: 'movementType',
      key: 'movementType',
      render: (type: string) => {
        let color = 'blue';
        if (type === 'IN') color = 'green';
        if (type === 'OUT') color = 'red';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right' as const,
      render: (val: number, r: InventoryMovement) => {
        const prefix = r.movementType === 'IN' ? '+' : r.movementType === 'OUT' ? '-' : '';
        const color = r.movementType === 'IN' ? '#16a34a' : r.movementType === 'OUT' ? '#dc2626' : '#2563eb';
        return <Text strong style={{ color }}>{prefix}{Number(val).toFixed(2)}</Text>;
      },
    },
    {
      title: 'Costo Unit.',
      dataIndex: 'unitCost',
      key: 'unitCost',
      align: 'right' as const,
      render: (val: number) => `$${Number(val).toFixed(2)}`,
    },
    {
      title: 'Notas',
      dataIndex: 'notes',
      key: 'notes',
    },
  ];

  return (
    <div>
      <Title level={2}>Kardex / Auditoría de Movimientos</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Text strong>Seleccionar Producto: </Text>
        <Select
          showSearch
          style={{ width: 400, marginLeft: 16 }}
          placeholder="Busca un producto..."
          optionFilterProp="children"
          onChange={setSelectedProductId}
        >
          {products?.map(p => (
            <Option key={p.id} value={p.id}>
              {p.code} - {p.name}
            </Option>
          ))}
        </Select>
      </Card>

      <Card>
        {selectedProductId ? (
          <Table 
            dataSource={movements} 
            columns={columns} 
            rowKey="id" 
            loading={isLoading} 
            size="small"
            pagination={{ pageSize: 15 }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            Selecciona un producto para visualizar su historial de movimientos.
          </div>
        )}
      </Card>
    </div>
  );
};
