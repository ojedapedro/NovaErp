import React, { useState, useMemo } from 'react';
import { Card, Typography, Button, Form, Select, DatePicker, Table, InputNumber, Switch, Space, message, Row, Col } from 'antd';
import { SaveOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { facturacionApi, type Customer, type Product } from '../../api/facturacion';
import dayjs from 'dayjs';
import { useBarcodeInput } from '../../hooks/useBarcodeInput';
import { BarcodeScanner } from '../../components/BarcodeScanner';

const { Title, Text } = Typography;
const { Option } = Select;

export const NuevaFactura: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  
  const [selectedItems, setSelectedItems] = useState<Array<{ id: string; productId: string; quantity: number; unitPrice: number; product?: Product }>>([]);
  const [applyIgtf, setApplyIgtf] = useState(false);

  // Queries
  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: facturacionApi.getCustomers });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: facturacionApi.getProducts });

  // Mutation
  const createMutation = useMutation({
    mutationFn: facturacionApi.createInvoice,
    onSuccess: () => {
      message.success('Factura emitida correctamente');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate('/facturacion/facturas');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al emitir la factura');
    },
  });

  const handleAddProduct = (productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (!product) return;

    setSelectedItems([
      ...selectedItems,
      { id: Date.now().toString(), productId, quantity: 1, unitPrice: product.unitPrice, product }
    ]);
  };

  const handleBarcodeOrQrScan = (code: string) => {
    if (!products) return;
    const product = products.find(p => p.barcode === code || p.code === code || p.id === code);
    if (product) {
      handleAddProduct(product.id);
    } else {
      message.warning('Producto con código ' + code + ' no encontrado en catálogo');
    }
  };

  useBarcodeInput({ onScan: handleBarcodeOrQrScan, enabled: true });

  const handleUpdateQuantity = (id: string, quantity: number | null) => {
    setSelectedItems(items => items.map(item => item.id === id ? { ...item, quantity: quantity || 1 } : item));
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems(items => items.filter(item => item.id !== id));
  };

  // Calculations
  const totals = useMemo(() => {
    let subtotal = 0;
    let taxAmount = 0;
    
    selectedItems.forEach(item => {
      const lineSubtotal = item.quantity * item.unitPrice;
      const isTaxable = item.product?.taxType === 'IVA_GENERAL'; // simplified
      const lineTax = isTaxable ? lineSubtotal * 0.16 : 0;
      
      subtotal += lineSubtotal;
      taxAmount += lineTax;
    });

    const igtfAmount = applyIgtf ? (subtotal + taxAmount) * 0.03 : 0;
    const total = subtotal + taxAmount + igtfAmount;

    return { subtotal, taxAmount, igtfAmount, total };
  }, [selectedItems, applyIgtf]);

  const handleSubmit = (values: any) => {
    if (selectedItems.length === 0) {
      message.error('Debe agregar al menos un producto a la factura');
      return;
    }

    createMutation.mutate({
      customerId: values.customerId,
      invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
      currency: 'USD',
      exchangeRate: 1,
      applyIgtf,
      items: selectedItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }))
    });
  };

  const columns = [
    { title: 'Producto', key: 'product', render: (_: any, r: any) => r.product?.name },
    { title: 'Precio', key: 'price', render: (_: any, r: any) => `$${Number(r.unitPrice).toFixed(2)}` },
    { 
      title: 'Cantidad', 
      key: 'quantity', 
      render: (_: any, r: any) => (
        <InputNumber min={0.01} value={r.quantity} onChange={(val) => handleUpdateQuantity(r.id, val)} />
      )
    },
    { 
      title: 'Subtotal', 
      key: 'subtotal', 
      align: 'right' as const,
      render: (_: any, r: any) => `$${(r.quantity * r.unitPrice).toFixed(2)}`
    },
    {
      title: '',
      key: 'action',
      render: (_: any, r: any) => (
        <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleRemoveItem(r.id)} />
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/facturacion/facturas')} style={{ marginRight: 8 }} />
        <Title level={2} style={{ margin: 0 }}>Emitir Factura</Title>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ invoiceDate: dayjs() }}>
        <Row gutter={16}>
          <Col span={16}>
            <Card title="Datos de la Factura" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="customerId" label="Cliente" rules={[{ required: true, message: 'Requerido' }]}>
                    <Select showSearch optionFilterProp="children" placeholder="Seleccione un cliente">
                      {customers?.map(c => <Option key={c.id} value={c.id}>{c.legalName} ({c.rif})</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="invoiceDate" label="Fecha de Emisión" rules={[{ required: true, message: 'Requerido' }]}>
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Detalle de Productos">
              <div style={{ display: 'flex', gap: '8px', marginBottom: 16 }}>
                <Select 
                  showSearch 
                  placeholder="Buscar y agregar producto..." 
                  style={{ flex: 1 }}
                  value={null}
                  onChange={handleAddProduct}
                  optionFilterProp="children"
                >
                  {products?.map(p => <Option key={p.id} value={p.id}>{p.code} - {p.name} | Stock: {p.stock} | ${p.unitPrice}</Option>)}
                </Select>
                <BarcodeScanner onScan={handleBarcodeOrQrScan} buttonText='Escanear' />
              </div>

              <Table 
                dataSource={selectedItems} 
                columns={columns} 
                rowKey="id" 
                pagination={false} 
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card title="Resumen" style={{ position: 'sticky', top: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Subtotal (Base Imponible)</Text>
                <Text strong>${totals.subtotal.toFixed(2)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>IVA (16%)</Text>
                <Text strong>${totals.taxAmount.toFixed(2)}</Text>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 16 }}>
                <Text>Aplica IGTF (3% Divisas)</Text>
                <Switch checked={applyIgtf} onChange={setApplyIgtf} />
              </div>
              
              {applyIgtf && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>IGTF (3%)</Text>
                  <Text strong>${totals.igtfAmount.toFixed(2)}</Text>
                </div>
              )}

              <div style={{ borderTop: '1px solid #f0f0f0', margin: '16px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>Total General</Title>
                <Title level={4} style={{ margin: 0, color: '#1677ff' }}>${totals.total.toFixed(2)}</Title>
              </div>

              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />} 
                block 
                size="large"
                loading={createMutation.isPending}
              >
                Emitir Factura
              </Button>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};
