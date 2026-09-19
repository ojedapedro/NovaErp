import React from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Tag } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarCircleOutlined,
  ShopOutlined,
  UsergroupAddOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';

const { Title, Text } = Typography;

const formatVES = (val: number) =>
  new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
  });

  if (isLoading) {
    return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>;
  }

  const ingresos = stats?.totalVentas ?? 0;
  const egresos = stats?.totalCompras ?? 0;
  const balance = ingresos - egresos;
  const balancePositivo = balance >= 0;

  const pieData = [
    { name: 'Ingresos', value: ingresos },
    { name: 'Egresos', value: egresos },
  ];
  const PIE_COLORS = ['#16A34A', '#DC2626'];

  return (
    <div style={{ padding: '0 4px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontFamily: 'Poppins, sans-serif', color: '#111827' }}>
          Dashboard Gerencial
        </Title>
        <Text style={{ color: '#6B7280', fontSize: 14 }}>
          Resumen financiero en tiempo real
        </Text>
      </div>

      {/* KPI Cards — Fila 1 */}
      <Row gutter={[16, 16]}>
        {/* Ventas / Ingresos */}
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderLeft: '4px solid #16A34A', borderRadius: 4 }}>
            <Statistic
              title={<Text strong style={{ color: '#374151' }}>Ingresos Totales</Text>}
              value={ingresos}
              precision={2}
              valueStyle={{ color: '#16A34A', fontSize: 22 }}
              prefix={<ArrowUpOutlined />}
              suffix="VES"
              formatter={(v) => formatVES(Number(v))}
            />
          </Card>
        </Col>

        {/* Egresos / Compras */}
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderLeft: '4px solid #DC2626', borderRadius: 4 }}>
            <Statistic
              title={<Text strong style={{ color: '#374151' }}>Egresos Totales</Text>}
              value={egresos}
              precision={2}
              valueStyle={{ color: '#DC2626', fontSize: 22 }}
              prefix={<ArrowDownOutlined />}
              suffix="VES"
              formatter={(v) => formatVES(Number(v))}
            />
          </Card>
        </Col>

        {/* KPI NUEVO: Balance Ingresos vs Egresos */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderLeft: `4px solid ${balancePositivo ? '#3B82F6' : '#D97706'}`,
              borderRadius: 4,
            }}
          >
            <Statistic
              title={
                <span>
                  <Text strong style={{ color: '#374151' }}>Balance Neto &nbsp;</Text>
                  {balancePositivo
                    ? <Tag color="green" icon={<RiseOutlined />}>Superávit</Tag>
                    : <Tag color="red" icon={<FallOutlined />}>Déficit</Tag>
                  }
                </span>
              }
              value={Math.abs(balance)}
              precision={2}
              valueStyle={{ color: balancePositivo ? '#3B82F6' : '#D97706', fontSize: 22 }}
              prefix={balancePositivo ? '+' : '-'}
              suffix="VES"
              formatter={(v) => formatVES(Number(v))}
            />
          </Card>
        </Col>

        {/* CxC */}
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderLeft: '4px solid #D97706', borderRadius: 4 }}>
            <Statistic
              title={<Text strong style={{ color: '#374151' }}>CxC Pendiente</Text>}
              value={stats?.cuentasPorCobrar ?? 0}
              precision={2}
              valueStyle={{ color: '#D97706', fontSize: 22 }}
              prefix={<DollarCircleOutlined />}
              suffix="VES"
              formatter={(v) => formatVES(Number(v))}
            />
          </Card>
        </Col>
      </Row>

      {/* KPI Cards — Fila 2 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderLeft: '4px solid #FA541C', borderRadius: 4 }}>
            <Statistic
              title={<Text strong style={{ color: '#374151' }}>CxP Pendiente</Text>}
              value={stats?.cuentasPorPagar ?? 0}
              precision={2}
              valueStyle={{ color: '#FA541C', fontSize: 22 }}
              prefix={<ShopOutlined />}
              suffix="VES"
              formatter={(v) => formatVES(Number(v))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderLeft: '4px solid #6366F1', borderRadius: 4 }}>
            <Statistic
              title={<Text strong style={{ color: '#374151' }}>Total Clientes</Text>}
              value={stats?.customersCount ?? 0}
              valueStyle={{ color: '#6366F1', fontSize: 22 }}
              prefix={<UsergroupAddOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderLeft: '4px solid #8B5CF6', borderRadius: 4 }}>
            <Statistic
              title={<Text strong style={{ color: '#374151' }}>Total Productos</Text>}
              value={stats?.productsCount ?? 0}
              valueStyle={{ color: '#8B5CF6', fontSize: 22 }}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* BarChart Ventas vs Compras */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Text strong style={{ fontFamily: 'Poppins, sans-serif', color: '#111827' }}>
                📊 Evolución Mensual — Ingresos vs Egresos (6 meses)
              </Text>
            }
            style={{ borderRadius: 4 }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats?.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip
                  formatter={(value: number) => [`${formatVES(value)} VES`]}
                  contentStyle={{ borderRadius: 4, border: '1px solid #E5E7EB' }}
                />
                <Legend />
                <Bar dataKey="ventas" name="Ingresos" fill="#16A34A" radius={[3, 3, 0, 0]} />
                <Bar dataKey="compras" name="Egresos" fill="#DC2626" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* PieChart Ingresos vs Egresos */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Text strong style={{ fontFamily: 'Poppins, sans-serif', color: '#111827' }}>
                🥧 Ingresos vs Egresos
              </Text>
            }
            style={{ borderRadius: 4 }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${formatVES(v)} VES`]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <Text style={{ color: '#6B7280', fontSize: 13 }}>
                Balance:{' '}
                <Text strong style={{ color: balancePositivo ? '#16A34A' : '#DC2626' }}>
                  {balancePositivo ? '+' : '-'}{formatVES(Math.abs(balance))} VES
                </Text>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
