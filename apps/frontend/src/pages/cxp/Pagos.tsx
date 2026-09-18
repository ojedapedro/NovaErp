import React, { useState } from "react";
import { Card, Typography, Table, Button, Space, Modal, Form, Select, DatePicker, Input, InputNumber, message, Tabs, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cxpApi } from "../../api/cxp";
import { comprasApi } from "../../api/compras";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

export const Pagos: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const { data: suppliers } = useQuery({ queryKey: ["suppliers"], queryFn: comprasApi.getSuppliers });
  
  const { data: pendingInvoices, isLoading: isLoadingPending } = useQuery({
    queryKey: ["pending-purchase-invoices", selectedSupplierId],
    queryFn: () => cxpApi.getPendingInvoices(selectedSupplierId || undefined),
    enabled: !!selectedSupplierId
  });

  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["cxp-payments"],
    queryFn: cxpApi.getPayments
  });

  const createMutation = useMutation({
    mutationFn: cxpApi.registerPayment,
    onSuccess: () => {
      message.success("Pago registrado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["cxp-payments"] });
      queryClient.invalidateQueries({ queryKey: ["pending-purchase-invoices"] });
      setIsModalOpen(false);
      form.resetFields();
      setSelectedSupplierId(null);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Error al registrar pago");
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
    
    const existing = items.findIndex((i: any) => i.purchaseInvoiceId === invoice.id);
    if (existing >= 0) {
      items[existing].amountApplied = balance;
    } else {
      items.push({ purchaseInvoiceId: invoice.id, amountApplied: balance });
    }
    form.setFieldsValue({ items: [...items] });
  };

  const paymentColumns = [
    { title: "N° Recibo / Egreso", dataIndex: "receiptNumber", key: "receiptNumber" },
    { title: "Fecha", dataIndex: "paymentDate", key: "paymentDate", render: (v: string) => dayjs(v).format("DD/MM/YYYY") },
    { title: "Proveedor", key: "supplier", render: (_: any, r: any) => r.supplier?.legalName },
    { title: "Método", dataIndex: "paymentMethod", key: "paymentMethod" },
    { title: "Monto", dataIndex: "amount", key: "amount", align: "right" as const, render: (v: number, r: any) => `${Number(v).toFixed(2)} ${r.currency}` },
    { title: "Referencia", dataIndex: "reference", key: "reference" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Cuentas por Pagar</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Registrar Egreso / Pago
        </Button>
      </div>

      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Egresos y Pagos" key="1">
            <Table dataSource={payments} columns={paymentColumns} rowKey="id" loading={isLoadingPayments} size="small" />
          </TabPane>
          <TabPane tab="Estado de Cuenta por Proveedor" key="2">
             <div style={{ marginBottom: 16 }}>
                <Select
                  showSearch
                  placeholder="Seleccione un proveedor"
                  style={{ width: 400 }}
                  onChange={setSelectedSupplierId}
                  value={selectedSupplierId}
                  optionFilterProp="children"
                >
                  {suppliers?.map((s: any) => (
                    <Option key={s.id} value={s.id}>{s.legalName} ({s.rif})</Option>
                  ))}
                </Select>
             </div>
             {selectedSupplierId && (
               <Table 
                 dataSource={pendingInvoices} 
                 rowKey="id"
                 loading={isLoadingPending}
                 size="small"
                 columns={[
                    { title: "Factura N°", dataIndex: "invoiceNumber", key: "invoiceNumber" },
                    { title: "Control", dataIndex: "controlNumber", key: "controlNumber" },
                    { title: "Fecha", dataIndex: "invoiceDate", key: "invoiceDate", render: (v: string) => dayjs(v).format("DD/MM/YYYY") },
                    { title: "Monto Total", dataIndex: "total", key: "total", align: "right", render: (v: number) => Number(v).toFixed(2) },
                    { title: "Monto Pagado", dataIndex: "amountPaid", key: "amountPaid", align: "right", render: (v: number) => Number(v).toFixed(2) },
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
        title="Registrar Pago a Proveedor"
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); setSelectedSupplierId(null); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="supplierId" label="Proveedor" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="children" onChange={setSelectedSupplierId}>
              {suppliers?.map((s: any) => (
                <Option key={s.id} value={s.id}>{s.legalName} ({s.rif})</Option>
              ))}
            </Select>
          </Form.Item>
          
          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item name="receiptNumber" label="N° de Egreso/Recibo" rules={[{ required: true }]} style={{ flex: 1 }}>
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
            <Form.Item name="reference" label="Referencia / N° Lote" style={{ flex: 2 }}>
              <Input />
            </Form.Item>
          </div>

          {selectedSupplierId && (
            <Card size="small" title="Facturas Pendientes de Pago" style={{ marginTop: 16 }}>
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <Table 
                    dataSource={pendingInvoices}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    columns={[
                      { title: "Factura", dataIndex: "invoiceNumber" },
                      { title: "Saldo", key: "balance", render: (_: any, r: any) => (Number(r.total) - Number(r.amountPaid)).toFixed(2) },
                      { 
                        title: "Monto a Aplicar", 
                        key: "apply",
                        render: (_: any, r: any) => {
                          const items = form.getFieldValue("items") || [];
                          const idx = items.findIndex((i: any) => i.purchaseInvoiceId === r.id);
                          
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
                                    newItems.push({ purchaseInvoiceId: r.id, amountApplied: val });
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
