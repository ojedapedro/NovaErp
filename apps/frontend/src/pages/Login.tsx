import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Checkbox, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, LineChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api';

const { Title, Text, Link } = Typography;

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      // Solo enviamos email y password, excluyendo 'remember' que causa el Error 400
      const payload = {
        email: values.email,
        password: values.password
      };
      const response = await apiClient.post('/auth/login', payload);
      const { accessToken, user } = response.data;
      setAuth(accessToken, {
        ...user,
        permissions: ['journal:create', 'journal:approve'],
      });
      message.success('Inicio de sesión exitoso');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23cbd5e1' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      position: 'relative'
    }}>
      <Card 
        bodyStyle={{ padding: 0 }} 
        style={{ 
          width: 850, 
          maxWidth: '95%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderRadius: 16,
          overflow: 'hidden',
          border: 'none'
        }}
      >
        <Row>
          {/* Left Side - Illustration */}
          <Col xs={0} md={11} style={{ 
            backgroundColor: '#f1f5f9', 
            padding: '40px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRight: '1px solid #e2e8f0'
          }}>
            <div style={{ marginBottom: 40, position: 'relative', width: 200, height: 160 }}>
                {/* Simulated charts/people for the placeholder */}
                <div style={{ position: 'absolute', bottom: 0, left: 10, width: 40, height: 80, backgroundColor: '#cbd5e1', borderRadius: '4px 4px 0 0' }}></div>
                <div style={{ position: 'absolute', bottom: 0, left: 60, width: 40, height: 120, backgroundColor: '#94a3b8', borderRadius: '4px 4px 0 0' }}></div>
                <div style={{ position: 'absolute', bottom: 0, left: 110, width: 40, height: 150, backgroundColor: '#3b82f6', borderRadius: '4px 4px 0 0' }}></div>
                <LineChartOutlined style={{ position: 'absolute', top: 0, right: 0, fontSize: 64, color: '#1e293b', opacity: 0.8 }} />
            </div>

            <Title level={4} style={{ textAlign: 'center', color: '#334155', marginTop: 16, fontSize: '1.1rem', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
              Potencia la Gestión Fiscal y Financiera de tu Negocio en Venezuela con NovaERP.
            </Title>
          </Col>

          {/* Right Side - Form */}
          <Col xs={24} md={13} style={{ padding: '48px 40px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              {/* Logo SVG */}
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 12 }}>
                <path d="M10 30L20 10L30 30" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 20H30" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="10" r="4" fill="#f59e0b"/>
              </svg>
              <Title level={2} style={{ margin: 0, color: '#1e293b', fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.5px' }}>
                Nova<span style={{ color: '#d97706' }}>ERP</span>
              </Title>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Text style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>Sistema de Gestión Fiscal Venezolano</Text>
            </div>

            <Form
              name="login_form"
              layout="vertical"
              onFinish={onFinish}
              size="large"
              initialValues={{ remember: true }}
            >
              <Form.Item
                name="email"
                rules={[{ required: true, message: 'Por favor ingrese su correo' }, { type: 'email', message: 'Correo inválido' }]}
              >
                <Input 
                  prefix={<UserOutlined style={{ color: '#94a3b8' }} />} 
                  placeholder="admin@novaerp.ve" 
                  style={{ borderRadius: 6, backgroundColor: '#f8fafc' }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Por favor ingrese su contraseña' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: '#94a3b8' }} />} 
                  placeholder="••••••••••••" 
                  style={{ borderRadius: 6, backgroundColor: '#f8fafc' }}
                />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox style={{ color: '#475569' }}>Recordar mi sesión</Checkbox>
                </Form.Item>
                <Link href="#" style={{ color: '#3b82f6', fontSize: '14px' }}>
                  Olvidé mi contraseña?
                </Link>
              </div>

              <Form.Item style={{ marginBottom: 16 }}>
                <Button type="primary" htmlType="submit" block loading={loading} style={{ borderRadius: 6, height: 44, fontSize: '16px', fontWeight: 500, backgroundColor: '#3b82f6' }}>
                  Ingresar
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center' }}>
                <Link href="#" style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                  Crear una cuenta nueva
                </Link>
              </div>
            </Form>
          </Col>
        </Row>
      </Card>

      <div style={{ position: 'absolute', bottom: 20, textAlign: 'center', width: '100%' }}>
        <Text style={{ color: '#64748b', fontSize: '12px' }}>
          © 2026 NovaERP de Venezuela - Todos los derechos reservados.
        </Text>
      </div>
    </div>
  );
};
