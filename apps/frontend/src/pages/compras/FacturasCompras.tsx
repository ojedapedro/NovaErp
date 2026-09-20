import React, { useState } from "react";
import { Table, Button, Card, Typography, Tag, Modal, Form, Input, InputNumber, Select, DatePicker, message, Row, Col, Divider, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { comprasApi, type PurchaseInvoice } from "../../api/compras";
import { facturacionApi, type Product } from "../../api/facturacion";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

export const FacturasCompras: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  
  // Computed totals for UI
  const [totals, setTotals] = useState({ subtotal: 0, taxAmount: 0, total: 0 });

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["purchase-invoices"],
    queryFn: comprasApi.getPurchaseInvoices,
  });

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: comprasApi.getSuppliers,
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: facturacionApi.getProducts,
  });

  const createMutation = useMutation({
    mutationFn: comprasApi.createPurchaseInvoice,
    onSuccess: () => {
      message.success("Factura de compra registrada y el inventario fue actualizado");
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsModalOpen(false);
      form.resetFields();
      setTotals({ subtotal: 0, taxAmount: 0, total: 0 });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Error al registrar factura");
    },
  });

  // Calculate live totals whenever items change
  const handleValuesChange = (_changedValues: any, allValues: any) => {
    if (allValues.items) {
      let subtotal = 0;
      let taxAmount = 0;

      allValues.items.forEach((item: any) => {
        if (item && item.productId && item.quantity && item.unitPrice) {
          const product = products?.find(p => p.id === item.productId);
          const taxRate = product?.taxType === 'EXENTO' ? 0 : 0.16;
          
          const lineSubtotal = item.quantity * item.unitPrice;
          subtotal += lineSubtotal;
          taxAmount += lineSubtotal * taxRate;
        }
      });

      setTotals({
        subtotal,
        taxAmount,
        total: subtotal + taxAmount
      });
    }
  };

  const handleSave = (values: any) => {
    if (!values.items || values.items.length === 0) {
      message.error("Debe agregar al menos un producto a la factura");
      return;
    }

    // Enrich items with correct taxRate before sending
    const enrichedItems = values.items.map((item: any) => {
      const product = products?.find(p => p.id === item.productId);
      return {
        ...item,
        taxRate: product?.taxType === 'EXENTO' ? 0 : 0.16
      };
    });

    const dto = {
      supplierId: values.supplierId,
      invoiceNumber: values.invoiceNumber,
      controlNumber: values.controlNumber,
      invoiceDate: values.invoiceDate.toISOString(),
      currency: values.currency || "VES",
      notes: values.notes,
      items: enrichedItems,
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
      render: (v: number) => <Text strong>{Number(v).toFixed(2)}</Text>,
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
        <Title level={2} style={{ margin: 0 }}>Gestión de Compras e Inventario</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Cargar Factura y Stock
        </Button>
      </div>
      <Card>
        <Table dataSource={invoices} columns={columns} rowKey="id" loading={isLoading} scroll={{ x: 900 }} size="small" />
      </Card>

      <Modal
        title={<Title level={4} style={{ margin: 0 }}>Cargar Factura de Compra</Title>}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); setTotals({ subtotal: 0, taxAmount: 0, total: 0 }); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        width={900}
        okText="Guardar y Actualizar Stock"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" onFinish={handleSave} onValuesChange={handleValuesChange}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="supplierId" label="Proveedor" rules={[{ required: true, message: "Requerido" }]}>
                <Select showSearch optionFilterProp="children" placeholder="Seleccionar proveedor">
                  {suppliers?.map((s) => (
                    <Option key={s.id} value={s.id}>{s.legalName} ({s.rif})</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="invoiceDate" label="Fecha" rules={[{ required: true }]}>
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="currency" label="Moneda" initialValue="VES">
                <Select>
                  <Option value="VES">VES</Option>
                  <Option value="USD">USD</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="invoiceNumber" label="Nº de Factura" rules={[{ required: true }]}>
                <Input placeholder="Ej: 000001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="controlNumber" label="Nº de Control" rules={[{ required: true }]}>
                <Input placeholder="Ej: 00-000001" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Productos de la Factura (Ingreso a Inventario)</Divider>
          
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'productId']}
                      rules={[{ required: true, message: 'Producto requerido' }]}
                      style={{ width: 350 }}
                    >
                      <Select showSearch placeholder="Seleccionar producto..." optionFilterProp="children">
                        {products?.map(p => (
                          <Option key={p.id} value={p.id}>
                            {p.code} - {p.name} {p.taxType === 'EXENTO' && '(Exento)'}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Falta cant.' }]}
                    >
                      <InputNumber placeholder="Cant." min={0.01} step={1} style={{ width: 100 }} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'unitPrice']}
                      rules={[{ required: true, message: 'Falta precio' }]}
                    >
                      <InputNumber placeholder="Costo Unit." min={0} step={0.01} style={{ width: 140 }} />
                    </Form.Item>

                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red', cursor: 'pointer' }} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Añadir Producto
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Card size="small" style={{ backgroundColor: '#f9fafb', marginTop: 16 }}>
            <Row justify="end">
              <Col span={8}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>Subtotal:</Text>
                  <Text>{totals.subtotal.toFixed(2)} VES</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>IVA:</Text>
                  <Text>{totals.taxAmount.toFixed(2)} VES</Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: 16 }}>TOTAL:</Text>
                  <Text strong style={{ fontSize: 16, color: '#16a34a' }}>{totals.total.toFixed(2)} VES</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Form>
      </Modal>
    </div>
  );
};

const MinusCircleOutlined = ({ onClick, style }: any) => (
  <DeleteOutlined onClick={onClick} style={style} />
);
