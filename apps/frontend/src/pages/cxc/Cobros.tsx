import React, { useState } from "react";
import { Card, Typography, Table, Button, Space, Modal, Form, Select, DatePicker, Input, InputNumber, message, Tabs, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cxcApi } from "../../api/cxc";
import { facturacionApi } from "../../api/facturacion";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

export const Cobros: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const { data: customers } = useQuery({ queryKey: ["customers"], queryFn: facturacionApi.getCustomers });
  
  const { data: pendingInvoices, isLoading: isLoadingPending } = useQuery({
    queryKey: ["pending-invoices", selectedCustomerId],
    queryFn: () => cxcApi.getPendingInvoices(selectedCustomerId || undefined),
    enabled: !!selectedCustomerId
  });

  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["cxc-payments"],
    queryFn: cxcApi.getPayments
  });

  const createMutation = useMutation({
    mutationFn: cxcApi.registerPayment,
    onSuccess: () => {
      message.success("Cobro registrado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["cxc-payments"] });
      queryClient.invalidateQueries({ queryKey: ["pending-invoices"] });
      setIsModalOpen(false);
      form.resetFields();
      setSelectedCustomerId(null);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Error al registrar cobro");
    }
  });

  const handleSave = (values: any) => {
    if (!values.items || values.items.length === 0) {
      return message.warning("Debe seleccionar al menos una factura");
    }
    const dto = {
      ...values,
      paymentDate: values.paymentDate.toISOString(),
    };
    createMutation.mutate(dto);
  };

  const handleApplyFull = (invoice: any) => {
    const items = form.getFieldValue("items") || [];
    const balance = Number(invoice.total) - Number(invoice.amountPaid);
    
    const existing = items.findIndex((i: any) => i.invoiceId === invoice.id);
    if (existing >= 0) {
      items[existing].amountApplied = balance;
    } else {
      items.push({ invoiceId: invoice.id, amountApplied: balance });
    }
    form.setFieldsValue({ items: [...items] });
  };

  const paymentColumns = [
    { title: "N° Recibo", dataIndex: "receiptNumber", key: "receiptNumber" },
    { title: "Fecha", dataIndex: "paymentDate", key: "paymentDate", render: (v: string) => dayjs(v).format("DD/MM/YYYY") },
    { title: "Cliente", key: "customer", render: (_: any, r: any) => r.customer?.legalName },
    { title: "Método", dataIndex: "paymentMethod", key: "paymentMethod" },
    { title: "Monto", dataIndex: "amount", key: "amount", align: "right" as const, render: (v: number, r: any) => `${Number(v).toFixed(2)} ${r.currency}` },
    { title: "Referencia", dataIndex: "reference", key: "reference" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Cuentas por Cobrar</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Registrar Cobro
        </Button>
      </div>

      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Recibos de Cobro" key="1">
            <Table dataSource={payments} columns={paymentColumns} rowKey="id" loading={isLoadingPayments} size="small" />
          </TabPane>
          <TabPane tab="Estado de Cuenta por Cliente" key="2">
             <div style={{ marginBottom: 16 }}>
                <Select
                  showSearch
                  placeholder="Seleccione un cliente"
                  style={{ width: 400 }}
                  onChange={setSelectedCustomerId}
                  value={selectedCustomerId}
                  optionFilterProp="children"
                >
                  {customers?.map((c: any) => (
                    <Option key={c.id} value={c.id}>{c.legalName} ({c.rif})</Option>
                  ))}
                </Select>
             </div>
             {selectedCustomerId && (
               <Table 
                 dataSource={pendingInvoices} 
                 rowKey="id"
                 loading={isLoadingPending}
                 size="small"
                 columns={[
                    { title: "Factura N°", dataIndex: "number", key: "number" },
                    { title: "Fecha", dataIndex: "invoiceDate", key: "invoiceDate", render: (v: string) => dayjs(v).format("DD/MM/YYYY") },
                    { title: "Monto Total", dataIndex: "total", key: "total", align: "right", render: (v: number) => Number(v).toFixed(2) },
                    { title: "Monto Cobrado", dataIndex: "amountPaid", key: "amountPaid", align: "right", render: (v: number) => Number(v).toFixed(2) },
                    { 
                      title: "Saldo Pendiente", 
                      key: "balance", 
                      align: "right",
                      render: (_: any, r: any) => <strong style={{ color: 'red' }}>{(Number(r.total) - Number(r.amountPaid)).toFixed(2)}</strong> 
                    }
                 ]}
               />
             )}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="Registrar Nuevo Cobro"
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); setSelectedCustomerId(null); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="customerId" label="Cliente" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="children" onChange={setSelectedCustomerId}>
              {customers?.map((c: any) => (
                <Option key={c.id} value={c.id}>{c.legalName} ({c.rif})</Option>
              ))}
            </Select>
          </Form.Item>
          
          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item name="receiptNumber" label="N° de Recibo" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="paymentDate" label="Fecha de Pago" rules={[{ required: true }]} style={{ flex: 1 }}>
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="paymentMethod" label="Método de Pago" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select>
                <Option value="TRANSFERENCIA">Transferencia</Option>
                <Option value="PAGO_MOVIL">Pago Móvil</Option>
                <Option value="EFECTIVO">Efectivo</Option>
                <Option value="ZELLE">Zelle</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item name="currency" label="Moneda" initialValue="VES" style={{ flex: 1 }}>
              <Select>
                <Option value="VES">Bolívares (VES)</Option>
                <Option value="USD">Dólares (USD)</Option>
              </Select>
            </Form.Item>
            <Form.Item name="reference" label="Referencia" style={{ flex: 2 }}>
              <Input />
            </Form.Item>
          </div>

          {selectedCustomerId && (
            <Card size="small" title="Facturas Pendientes de Cobro" style={{ marginTop: 16 }}>
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <Table 
                    dataSource={pendingInvoices}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    columns={[
                      { title: "Factura", dataIndex: "number" },
                      { title: "Saldo", key: "balance", render: (_: any, r: any) => (Number(r.total) - Number(r.amountPaid)).toFixed(2) },
                      { 
                        title: "Monto a Aplicar", 
                        key: "apply",
                        render: (_: any, r: any) => {
                          const items = form.getFieldValue("items") || [];
                          const idx = items.findIndex((i: any) => i.invoiceId === r.id);
                          
                          return (
                            <Space>
                              <InputNumber 
                                min={0} 
                                max={Number(r.total) - Number(r.amountPaid)} 
                                step={0.01}
                                value={idx >= 0 ? items[idx].amountApplied : 0}
                                onChange={(val) => {
                                  const newItems = [...items];
                                  if (idx >= 0) {
                                    newItems[idx].amountApplied = val;
                                  } else {
                                    newItems.push({ invoiceId: r.id, amountApplied: val });
                                  }
                                  form.setFieldsValue({ items: newItems.filter((i: any) => i.amountApplied > 0) });
                                }}
                              />
                              <Button size="small" onClick={() => handleApplyFull(r)}>Totalidad</Button>
                            </Space>
                          );
                        }
                      }
                    ]}
                  />
                )}
              </Form.List>
            </Card>
          )}
        </Form>
      </Modal>
    </div>
  );
};
