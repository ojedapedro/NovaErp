import React, { useState } from 'react';
import { Layout, Menu, Button, Typography, Dropdown, Space } from 'antd';
import {
  DashboardOutlined,
  BookOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/contabilidad',
      icon: <BookOutlined />,
      label: 'Contabilidad',
      children: [
        { key: '/contabilidad/asientos', label: 'Asientos Diarios' },
        { key: '/contabilidad/cuentas', label: 'Plan de Cuentas' },
        { key: '/contabilidad/balance-comprobacion', label: 'Balance Comprobación' },
      ],
    },
    {
      key: '/facturacion',
      icon: <BookOutlined />,
      label: 'Facturación',
      children: [
        { key: '/facturacion/clientes', label: 'Clientes' },
        { key: '/facturacion/productos', label: 'Catálogo Productos' },
        { key: '/facturacion/facturas', label: 'Ventas / Facturas' },
      ],
    },
    {
      key: '/iva',
      icon: <FileTextOutlined />,
      label: 'Impuestos',
      children: [
        { key: '/iva/libro-ventas', label: 'Libro de Ventas' },
        { key: '/iva/libro-compras', label: 'Libro de Compras' },
      ],
    },
    {
      key: '/compras',
      icon: <FileTextOutlined />,
      label: 'Compras',
      children: [
        { key: '/compras/proveedores', label: 'Proveedores' },
        { key: '/compras/facturas', label: 'Facturas de Compra' },
      ],
    },
    {
      key: '/retenciones',
      icon: <FileTextOutlined />,
      label: 'Retenciones',
      children: [
        { key: '/retenciones/iva', label: 'Retenciones de IVA' },
        { key: '/retenciones/islr', label: 'Retenciones de ISLR' },
      ],
    },
    {
      key: '/cxc',
      icon: <DollarOutlined />,
      label: 'Cuentas por Cobrar',
    },
    {
      key: '/cxp',
      icon: <DollarOutlined />,
      label: 'Cuentas por Pagar',
    },
    {
      key: '/nomina',
      icon: <TeamOutlined />,
      label: 'Nómina',
    },
    {
      key: '/configuracion',
      icon: <SettingOutlined />,
      label: 'Parámetros Fiscales',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div
          style={{
            height: 32,
            margin: 16,
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'ERP' : 'NovaERP'}
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown
            menu={{
              items: [
                {
                  key: '1',
                  icon: <UserOutlined />,
                  label: <span style={{ fontWeight: 'bold' }}>{user?.fullName}</span>,
                  disabled: true,
                },
                {
                  type: 'divider',
                },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: 'Cerrar Sesión',
                  onClick: handleLogout,
                },
              ],
            }}
          >
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserOutlined /> Mi Cuenta
            </Button>
          </Dropdown>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: 8 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
