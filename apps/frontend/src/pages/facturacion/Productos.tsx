import React, { useState } from 'react';
import { Table, Button, Card, Typography, Modal, Form, Input, InputNumber, Select, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facturacionApi, type Product } from '../../api/facturacion';

const { Title } = Typography;
const { Option } = Select;

export const Productos: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: facturacionApi.getProducts,
  });

  const createMutation = useMutation({
    mutationFn: facturacionApi.createProduct,
    onSuccess: () => {
      message.success('Producto creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeModal();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al crear producto');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<Product> }) => facturacionApi.updateProduct(id, dto),
    onSuccess: () => {
      message.success('Producto actualizado');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeModal();
    },
  });

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      form.setFieldsValue(product);
    } else {
      setEditingProduct(null);
      form.resetFields();
      form.setFieldsValue({ unitMeasure: 'UND', taxType: 'IVA_GENERAL' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSave = async (values: any) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, dto: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns = [
    { title: 'C�digo', dataIndex: 'code', key: 'code', width: '15%' },
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { 
      title: 'Precio (Base)', 
      dataIndex: 'unitPrice', 
      key: 'unitPrice',
      render: (val: number) => $,
    },
    { 
      title: 'Stock', 
      dataIndex: 'stock', 
      key: 'stock',
      render: (val: number) => <Typography.Text strong>{Number(val || 0).toFixed(2)}</Typography.Text>
    },
    { title: 'Unidad', dataIndex: 'unitMeasure', key: 'unitMeasure' },
    { title: 'Tipo de Impuesto', dataIndex: 'taxType', key: 'taxType' },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Product) => (
        <Button type="text" icon={<EditOutlined />} onClick={() => openModal(record)} />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Catálogo de Productos / Servicios</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Nuevo Producto
        </Button>
      </div>

      <Card>
        <Table
          dataSource={products}
          columns={columns}
          rowKey="id"
          loading={isLoading}
        />
      </Card>

      <Modal
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="code" label="Código SKU" rules={[{ required: true, message: 'Requerido' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Nombre del Producto o Servicio" rules={[{ required: true, message: 'Requerido' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descripción (Opcional)">
            <Input.TextArea rows={2} />
          </Form.Item>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="unitPrice" label="Precio Base (Sin IVA)" rules={[{ required: true, message: 'Requerido' }]} style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} min={0} step={0.01} addonBefore="$" />
            </Form.Item>
            <Form.Item name="unitMeasure" label="Unidad" rules={[{ required: true, message: 'Requerido' }]} style={{ flex: 1 }}>
              <Select>
                <Option value="UND">Unidad (UND)</Option>
                <Option value="KG">Kilogramos (KG)</Option>
                <Option value="LTS">Litros (LTS)</Option>
                <Option value="SRV">Servicio (SRV)</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="taxType" label="Aplica Impuesto" rules={[{ required: true, message: 'Requerido' }]}>
            <Select>
              <Option value="IVA_GENERAL">IVA General (16%)</Option>
              <Option value="IVA_REDUCIDO">IVA Reducido (8%)</Option>
              <Option value="EXENTO">Exento (0%)</Option>
            </Select>
          </Form.Item>

          {editingProduct && (
            <Form.Item name="isActive" label="Activo" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};
