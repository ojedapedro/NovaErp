import React from 'react';
import { Table, Typography, Card, Statistic, Row, Col } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { inventarioApi, type ValuedProduct } from '../../api/inventario';

const { Title } = Typography;

export const Valorizado: React.FC = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['inventario-valorizado'],
    queryFn: inventarioApi.getInventarioValorizado,
  });

  const totalValuation = products?.reduce((sum, p) => sum + Number(p.valorTotal), 0) || 0;
  const totalItems = products?.reduce((sum, p) => sum + Number(p.stock), 0) || 0;

  const columns = [
    { title: 'Código', dataIndex: 'code', key: 'code' },
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    {
      title: 'Stock Actual',
      dataIndex: 'stock',
      key: 'stock',
      align: 'right' as const,
      render: (val: number) => Number(val).toFixed(2),
    },
    { title: 'Unidad', dataIndex: 'unitMeasure', key: 'unitMeasure' },
    {
      title: 'Costo Base Unit.',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right' as const,
      render: (val: number) => `$${Number(val).toFixed(2)}`,
    },
    {
      title: 'Valor Total',
      dataIndex: 'valorTotal',
      key: 'valorTotal',
      align: 'right' as const,
      render: (val: number) => <Typography.Text strong style={{ color: '#16a34a' }}>${Number(val).toFixed(2)}</Typography.Text>,
    },
  ];

  return (
    <div>
      <Title level={2}>Inventario Valorizado</Title>
      
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Valor Total del Inventario" value={totalValuation} precision={2} prefix="$" valueStyle={{ color: '#16a34a' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Total Unidades en Stock" value={totalItems} precision={2} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Total Referencias (SKU)" value={products?.length || 0} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table 
          dataSource={products} 
          columns={columns} 
          rowKey="id" 
          loading={isLoading} 
          size="small"
        />
      </Card>
    </div>
  );
};
