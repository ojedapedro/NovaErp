import React, { useState } from "react";
import { Card, Typography, Table, Button, Select, Space, Modal, Form, Input, DatePicker, message } from "antd";
import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { retencionesApi } from "../../api/retenciones";
import { comprasApi } from "../../api/compras";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

export const RetencionesIva: React.FC = () => {
  const queryClient = useQueryClient();
  const [year, setYear] = useState<number>(dayjs().year());
  const [month, setMonth] = useState<number>(dayjs().month() + 1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: withholdings, isLoading } = useQuery({
    queryKey: ["iva-withholdings", year, month],
    queryFn: retencionesApi.getIvaWithholdings,
  });

  const { data: invoices } = useQuery({
    queryKey: ["purchase-invoices"],
    queryFn: comprasApi.getPurchaseInvoices,
  });

  const createMutation = useMutation({
    mutationFn: retencionesApi.createIvaWithholding,
    onSuccess: () => {
      message.success("Retencion registrada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["iva-withholdings"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Error al registrar retencion");
    },
  });

  const handleExportTxt = () => {
    retencionesApi.downloadIvaTxt(year, month);
  };

  const handleSave = (values: any) => {
    const dto = {
      ...values,
      withholdingDate: values.withholdingDate.toISOString(),
    };
    createMutation.mutate(dto);
  };

  const columns = [
    { title: "Comprobante", dataIndex: "voucherNumber", key: "voucherNumber" },
    { title: "Fecha", dataIndex: "withholdingDate", key: "withholdingDate", render: (v: string) => dayjs(v).format("DD/MM/YYYY") },
    { title: "Proveedor", key: "supplier", render: (_: any, r: any) => r.purchaseInvoice?.supplier?.legalName },
    { title: "Factura", key: "invoice", render: (_: any, r: any) => r.purchaseInvoice?.invoiceNumber },
    { title: "Base Imponible", dataIndex: "baseAmount", key: "baseAmount", align: "right" as const, render: (v: number) => Number(v).toFixed(2) },
    { title: "IVA", dataIndex: "ivaAmount", key: "ivaAmount", align: "right" as const, render: (v: number) => Number(v).toFixed(2) },
    { title: "% Ret.", dataIndex: "withholdingPct", key: "withholdingPct", align: "right" as const, render: (v: number) => v + "%" },
    { title: "Retenido", dataIndex: "withheldAmount", key: "withheldAmount", align: "right" as const, render: (v: number) => Number(v).toFixed(2) },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Retenciones de IVA</Title>
        <Space>
          <Select value={month} onChange={setMonth} style={{ width: 120 }}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <Option key={m} value={m}>{dayjs().month(m - 1).format("MMMM").toUpperCase()}</Option>
            ))}
          </Select>
          <Select value={year} onChange={setYear} style={{ width: 100 }}>
            {[2024, 2025, 2026, 2027].map((y) => (
              <Option key={y} value={y}>{y}</Option>
            ))}
          </Select>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportTxt}>
            Exportar TXT
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Registrar Retencion
          </Button>
        </Space>
      </div>
      <Card>
        <Table dataSource={withholdings} columns={columns} rowKey="id" loading={isLoading} size="small" />
      </Card>

      <Modal
        title="Registrar Retencion de IVA"
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="purchaseInvoiceId" label="Factura de Compra" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="children">
              {invoices?.filter((i: any) => i.status !== "VOID" && !i.ivaWithheldAmount).map((inv: any) => (
                <Option key={inv.id} value={inv.id}>
                  {inv.supplier?.legalName} - Fact: {inv.invoiceNumber} (IVA: {inv.taxAmount})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="voucherNumber" label="Numero de Comprobante" rules={[{ required: true }]}>
            <Input placeholder="Ej: 2024091600000001" />
          </Form.Item>
          <Form.Item name="withholdingDate" label="Fecha" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="withholdingPct" label="Porcentaje de Retencion" rules={[{ required: true }]}>
            <Select>
              <Option value={75}>75% (Contribuyente Especial)</Option>
              <Option value={100}>100% (No inscrito / Compras sin derecho a credito)</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
