import React, { useState } from "react";
import { Table, Button, Card, Typography, Space, Modal, Form, Input, Switch, message } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { comprasApi, type Supplier } from "../../api/compras";

const { Title } = Typography;

export const Proveedores: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form] = Form.useForm();

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: comprasApi.getSuppliers,
  });

  const createMutation = useMutation({
    mutationFn: comprasApi.createSupplier,
    onSuccess: () => {
      message.success("Proveedor creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      closeModal();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Error al crear proveedor");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<Supplier> }) =>
      comprasApi.updateSupplier(id, dto),
    onSuccess: () => {
      message.success("Proveedor actualizado");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      closeModal();
    },
  });

  const openModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      form.setFieldsValue(supplier);
    } else {
      setEditingSupplier(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSave = async (values: any) => {
    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, dto: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns = [
    { title: "Razon Social", dataIndex: "legalName", key: "legalName" },
    { title: "RIF", dataIndex: "rif", key: "rif" },
    { title: "Correo", dataIndex: "email", key: "email" },
    { title: "Telefono", dataIndex: "phone", key: "phone" },
    {
      title: "Estado",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (isActive ? "Activo" : "Inactivo"),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Supplier) => (
        <Button type="text" icon={<EditOutlined />} onClick={() => openModal(record)} />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Proveedores</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Nuevo Proveedor
        </Button>
      </div>
      <Card>
        <Table dataSource={suppliers} columns={columns} rowKey="id" loading={isLoading} />
      </Card>
      <Modal
        title={editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="legalName" label="Razon Social / Nombre" rules={[{ required: true, message: "Requerido" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="rif" label="RIF / CI" rules={[{ required: true, message: "Requerido" }]}>
            <Input placeholder="Ej: J-12345678-9" />
          </Form.Item>
          <Form.Item name="email" label="Correo Electronico">
            <Input type="email" />
          </Form.Item>
          <Form.Item name="phone" label="Telefono">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Direccion Fiscal">
            <Input.TextArea rows={2} />
          </Form.Item>
          {editingSupplier && (
            <Form.Item name="isActive" label="Activo" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};
