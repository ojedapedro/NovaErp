import React from 'react';
import { Row, Col, Card, Statistic, Typography, Spin } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  DollarCircleOutlined,
  ShopOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';

const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats
  });

  if (isLoading) {
    return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Title level={2}>Dashboard Gerencial</Title>
      
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Ventas Totales (Emitidas)"
              value={stats?.totalVentas}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix="VES"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Cuentas por Cobrar"
              value={stats?.cuentasPorCobrar}
              precision={2}
              valueStyle={{ color: '#faad14' }}
              prefix={<DollarCircleOutlined />}
              suffix="VES"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Egresos / Compras Totales"
              value={stats?.totalCompras}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowDownOutlined />}
              suffix="VES"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Cuentas por Pagar"
              value={stats?.cuentasPorPagar}
              precision={2}
              valueStyle={{ color: '#fa541c' }}
              prefix={<ShopOutlined />}
              suffix="VES"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={16}>
          <Card title="Evolución Ventas vs Compras (Últimos 6 meses)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats?.chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ventas" name="Ventas" fill="#82ca9d" />
                <Bar dataKey="compras" name="Compras" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col span={8}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card>
                <Statistic
                  title="Total Clientes"
                  value={stats?.customersCount}
                  prefix={<UsergroupAddOutlined />}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Card>
                <Statistic
                  title="Total Productos"
                  value={stats?.productsCount}
                  prefix={<ShopOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};
