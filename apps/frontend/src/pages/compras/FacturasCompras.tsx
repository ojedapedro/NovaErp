import React, { useState } from "react";
import { Table, Button, Card, Typography, Tag, Modal, Form, Input, InputNumber, Select, DatePicker, message } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { comprasApi, type PurchaseInvoice, type Supplier } from "../../api/compras";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

export const FacturasCompras: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["purchase-invoices"],
    queryFn: comprasApi.getPurchaseInvoices,
  });

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: comprasApi.getSuppliers,
  });

  const createMutation = useMutation({
    mutationFn: comprasApi.createPurchaseInvoice,
    onSuccess: () => {
      message.success("Factura de compra registrada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Error al registrar factura");
    },
  });

  const handleSave = (values: any) => {
    const dto = {
      ...values,
      invoiceDate: values.invoiceDate.toISOString(),
      subtotal: Number(values.subtotal),
      taxAmount: Number(values.taxAmount),
      exemptAmount: Number(values.exemptAmount || 0),
      total: Number(values.subtotal) + Number(values.taxAmount),
    };
    createMutation.mutate(dto);
  };

  const columns = [
    {
      title: "Fecha",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Proveedor",
      key: "supplier",
      render: (_: any, r: PurchaseInvoice) => r.supplier?.legalName || r.supplierId,
    },
    {
      title: "RIF Proveedor",
      key: "rif",
      render: (_: any, r: PurchaseInvoice) => r.supplier?.rif || "",
    },
    { title: "N Factura", dataIndex: "invoiceNumber", key: "invoiceNumber" },
    { title: "N Control", dataIndex: "controlNumber", key: "controlNumber" },
    {
      title: "Base Imponible",
      dataIndex: "subtotal",
      key: "subtotal",
      align: "right" as const,
      render: (v: number) => Number(v).toFixed(2),
    },
    {
      title: "IVA",
      dataIndex: "taxAmount",
      key: "taxAmount",
      align: "right" as const,
      render: (v: number) => Number(v).toFixed(2),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      align: "right" as const,
      render: (v: number) => Number(v).toFixed(2),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <Tag color={s === "VOID" ? "red" : "green"}>{s}</Tag>,
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Facturas de Compras</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Registrar Factura
        </Button>
      </div>
      <Card>
        <Table dataSource={invoices} columns={columns} rowKey="id" loading={isLoading} scroll={{ x: 900 }} size="small" />
      </Card>

      <Modal
        title="Registrar Factura de Compra"
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="supplierId" label="Proveedor" rules={[{ required: true, message: "Requerido" }]}>
            <Select showSearch optionFilterProp="children" placeholder="Seleccionar proveedor">
              {suppliers?.map((s) => (
                <Option key={s.id} value={s.id}>{s.legalName} ({s.rif})</Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item name="invoiceNumber" label="N Factura" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input placeholder="Ej: 000001" />
            </Form.Item>
            <Form.Item name="controlNumber" label="N Control" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input placeholder="Ej: 00-000001" />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item name="invoiceDate" label="Fecha de la Factura" rules={[{ required: true }]} style={{ flex: 1 }}>
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="currency" label="Moneda" initialValue="VES" style={{ flex: 1 }}>
              <Select>
                <Option value="VES">Bolivares (VES)</Option>
                <Option value="USD">Dolares (USD)</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item name="subtotal" label="Base Imponible" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
            </Form.Item>
            <Form.Item name="exemptAmount" label="Monto Exento" initialValue={0} style={{ flex: 1 }}>
              <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
            </Form.Item>
            <Form.Item name="taxAmount" label="IVA (16%)" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Observaciones">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
