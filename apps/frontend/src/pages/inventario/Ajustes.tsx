import React, { useState, useEffect } from 'react';
import { Card, Typography, Select, InputNumber, Button, Form, Input, message, Row, Col, Alert } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facturacionApi } from '../../api/facturacion';
import { inventarioApi } from '../../api/inventario';
import { useBarcodeInput } from '../../hooks/useBarcodeInput';
import { BarcodeScanner } from '../../components/BarcodeScanner';

const { Title, Text } = Typography;
const { Option } = Select;

export const Ajustes: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: facturacionApi.getProducts,
  });

  const ajusteMutation = useMutation({
    mutationFn: inventarioApi.registrarAjuste,
    onSuccess: () => {
      message.success('Ajuste de inventario registrado correctamente (Toma Física)');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['kardex'] });
      queryClient.invalidateQueries({ queryKey: ['inventario-valorizado'] });
      form.resetFields();
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al registrar el ajuste');
    }
  });

  const handleProductChange = (productId: string) => {
    const product = products?.find(p => p.id === productId);
    setSelectedProduct(product);
    if (product) {
      form.setFieldsValue({ adjustedStock: Number(product.stock), productId });
    }
  };

  const handleBarcodeOrQrScan = (code: string) => {
    if (!products) return;
    const product = products.find(p => p.barcode === code || p.code === code || p.id === code);
    if (product) {
      handleProductChange(product.id);
    } else {
      message.warning('Producto con código ' + code + ' no encontrado en catálogo');
    }
  };

  useBarcodeInput({ onScan: handleBarcodeOrQrScan, enabled: true });

  const handleSave = (values: any) => {
    if (!selectedProduct) return;
    
    if (Number(values.adjustedStock) === Number(selectedProduct.stock)) {
      message.warning('El stock ajustado es idéntico al actual. No hay cambios.');
      return;
    }

    ajusteMutation.mutate({
      productId: values.productId,
      adjustedStock: values.adjustedStock,
      notes: values.notes
    });
  };

  return (
    <div>
      <Title level={2}>Toma Física y Ajustes de Inventario</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Usa este módulo para cuadrar el inventario teórico del sistema con el conteo físico real (mermas, sobrantes, extravíos).
      </Text>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Formulario de Ajuste">
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <Form.Item name="productId" label="Producto" rules={[{ required: true, message: 'Selecciona un producto' }]}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Select
                    showSearch
                    placeholder="Selecciona el producto a ajustar"
                    optionFilterProp="children"
                    onChange={handleProductChange}
                    style={{ flex: 1 }}
                  >
                    {products?.map(p => (
                      <Option key={p.id} value={p.id}>{p.code} - {p.name}</Option>
                    ))}
                  </Select>
                  <BarcodeScanner onScan={handleBarcodeOrQrScan} buttonText='Escanear' />
                </div>
              </Form.Item>

              {selectedProduct && (
                <Alert 
                  message="Stock Teórico Actual" 
                  description={<Text strong style={{ fontSize: 18 }}>{Number(selectedProduct.stock).toFixed(2)} {selectedProduct.unitMeasure}</Text>}
                  type="info" 
                  showIcon 
                  style={{ marginBottom: 16 }}
                />
              )}

              <Form.Item name="adjustedStock" label="Nuevo Stock Real (Físico)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} step={1} disabled={!selectedProduct} />
              </Form.Item>

              <Form.Item name="notes" label="Motivo del Ajuste (Notas)" rules={[{ required: true, message: 'Justifique el cambio' }]}>
                <Input.TextArea rows={3} placeholder="Ej: Merma por daño en almacén, Sobrante no registrado..." disabled={!selectedProduct} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" disabled={!selectedProduct} loading={ajusteMutation.isPending} block>
                  Guardar Ajuste de Inventario
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Información Importante" style={{ backgroundColor: '#fffbe6', borderColor: '#ffe58f' }}>
            <Title level={5}>Consecuencias del Ajuste</Title>
            <ul>
              <li>El sistema calculará automáticamente la diferencia entre el stock teórico y el físico.</li>
              <li>Se registrará un movimiento de tipo <strong>AJUSTE</strong> (Entrada o Salida) en el Kardex del producto.</li>
              <li>Afectará inmediatamente la <strong>valorización</strong> total del inventario.</li>
              <li>El responsable y la fecha quedarán auditados para futuras revisiones.</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
