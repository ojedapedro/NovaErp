import React, { useState } from 'react';
import { Table, Button, Card, Typography, Space, Modal, Form, Input, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facturacionApi, type Customer } from '../../api/facturacion';

const { Title } = Typography;

export const Clientes: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: facturacionApi.getCustomers,
  });

  const createMutation = useMutation({
    mutationFn: facturacionApi.createCustomer,
    onSuccess: () => {
      message.success('Cliente creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      closeModal();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al crear cliente');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<Customer> }) => facturacionApi.updateCustomer(id, dto),
    onSuccess: () => {
      message.success('Cliente actualizado');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      closeModal();
    },
  });

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      form.setFieldsValue(customer);
    } else {
      setEditingCustomer(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSave = async (values: any) => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, dto: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns = [
    { title: 'Razón Social / Nombre', dataIndex: 'legalName', key: 'legalName' },
    { title: 'RIF / CI', dataIndex: 'rif', key: 'rif' },
    { title: 'Correo', dataIndex: 'email', key: 'email' },
    { title: 'Teléfono', dataIndex: 'phone', key: 'phone' },
    { 
      title: 'Estado', 
      dataIndex: 'isActive', 
      key: 'isActive',
      render: (isActive: boolean) => isActive ? 'Activo' : 'Inactivo',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Customer) => (
        <Button type="text" icon={<EditOutlined />} onClick={() => openModal(record)} />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Clientes</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Nuevo Cliente
        </Button>
      </div>

      <Card>
        <Table
          dataSource={customers}
          columns={columns}
          rowKey="id"
          loading={isLoading}
        />
      </Card>

      <Modal
        title={editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="legalName" label="Razón Social / Nombre" rules={[{ required: true, message: 'Requerido' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="rif" label="RIF / CI" rules={[{ required: true, message: 'Requerido' }]}>
            <Input placeholder="Ej: J-12345678-9 o V-12345678" />
          </Form.Item>
          <Form.Item name="email" label="Correo Electrónico">
            <Input type="email" />
          </Form.Item>
          <Form.Item name="phone" label="Teléfono">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Dirección Fiscal">
            <Input.TextArea rows={2} />
          </Form.Item>
          {editingCustomer && (
            <Form.Item name="isActive" label="Activo" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};
