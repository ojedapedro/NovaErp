import React, { useState } from 'react';
import { Layout, Menu, Button, Typography, Dropdown, Space, Badge, Popover, List } from 'antd';
import {
  BellOutlined,
  DashboardOutlined,
  BookOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  TeamOutlined,
  DropboxOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '../api/alerts';
import dayjs from 'dayjs';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: unreadAlerts = [] } = useQuery({
    queryKey: ['unread-alerts'],
    queryFn: alertsApi.getUnread,
    refetchInterval: 60000,
  });

  const markReadMutation = useMutation({
    mutationFn: alertsApi.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['unread-alerts'] }),
  });

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
      key: '/compras',
      icon: <FileTextOutlined />,
      label: 'Compras',
      children: [
        { key: '/compras/proveedores', label: 'Proveedores' },
        { key: '/compras/facturas', label: 'Facturas de Compra' },
      ],
    },
    {
      key: '/inventario',
      icon: <DropboxOutlined />,
      label: 'Inventario',
      children: [
        { key: '/inventario/kardex', label: 'Auditoría / Kardex' },
        { key: '/inventario/valorizado', label: 'Inventario Valorizado' },
        { key: '/inventario/ajustes', label: 'Toma Física / Ajustes' },
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
      key: '/retenciones',
      icon: <FileTextOutlined />,
      label: 'Retenciones',
      children: [
        { key: '/retenciones/iva', label: 'Retenciones de IVA' },
        { key: '/retenciones/islr', label: 'Retenciones de ISLR' },
      ],
    },
    {
      key: 'cxc-group',
      icon: <DollarOutlined />,
      label: 'Cuentas por Cobrar',
      children: [
        { key: '/cxc', label: 'Cobros' },
        { key: '/cxc/aging', label: 'Antigüedad (Aging)' },
      ],
    },
    {
      key: 'cxp-group',
      icon: <DollarOutlined />,
      label: 'Cuentas por Pagar',
      children: [
        { key: '/cxp', label: 'Pagos' },
        { key: '/cxp/aging', label: 'Antigüedad (Aging)' },
      ],
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
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
          <Popover
            placement="bottomRight"
            title="Notificaciones"
            content={
              <div style={{ width: 380, maxHeight: 420, overflowY: 'auto' }}>
                <List
                  dataSource={unreadAlerts}
                  locale={{ emptyText: '✅ Sin alertas pendientes' }}
                  renderItem={(item: any) => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          size="small"
                          onClick={() => markReadMutation.mutate(item.id)}
                        >
                          Marcar leída
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={<span style={{ color: item.type === 'OVERDUE_INVOICE' ? '#cf1322' : '#cf6a19' }}>{item.title}</span>}
                        description={
                          <>
                            <div style={{ fontSize: 12 }}>{item.message}</div>
                            <small style={{ color: '#aaa' }}>{dayjs(item.createdAt).format('DD/MM/YY HH:mm')}</small>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            }
            trigger="click"
          >
            <Badge count={unreadAlerts.length} overflowCount={99}>
              <Button type="text" icon={<BellOutlined style={{ fontSize: 20 }} />} />
            </Badge>
          </Popover>
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
