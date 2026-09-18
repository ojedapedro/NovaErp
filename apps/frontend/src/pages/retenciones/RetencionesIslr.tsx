import React, { useState } from "react";
import { Card, Typography, Table, Button, Space, Modal, Form, Input, DatePicker, Select, InputNumber, message } from "antd";
import { PlusOutlined, DatabaseOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { retencionesApi } from "../../api/retenciones";
import { comprasApi } from "../../api/compras";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

export const RetencionesIslr: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: withholdings, isLoading } = useQuery({
    queryKey: ["islr-withholdings"],
    queryFn: retencionesApi.getIslrWithholdings,
  });

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: comprasApi.getSuppliers,
  });

  const { data: concepts } = useQuery({
    queryKey: ["islr-concepts"],
    queryFn: retencionesApi.getIslrConcepts,
  });

  const seedMutation = useMutation({
    mutationFn: retencionesApi.seedIslrConcepts,
    onSuccess: () => {
      message.success("Conceptos generados");
      queryClient.invalidateQueries({ queryKey: ["islr-concepts"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: retencionesApi.createIslrWithholding,
    onSuccess: () => {
      message.success("Retencion registrada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["islr-withholdings"] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Error al registrar retencion");
    },
  });

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
    { title: "Proveedor", key: "supplier", render: (_: any, r: any) => r.supplier?.legalName },
    { title: "Concepto", key: "concept", render: (_: any, r: any) => `${r.islrConcept?.code} - ${r.islrConcept?.description}` },
    { title: "Monto Pagado", dataIndex: "paymentAmount", key: "paymentAmount", align: "right" as const, render: (v: number) => Number(v).toFixed(2) },
    { title: "% Ret.", dataIndex: "withholdingRate", key: "withholdingRate", align: "right" as const, render: (v: number) => v + "%" },
    { title: "Sustraendo", dataIndex: "sustraendoBs", key: "sustraendoBs", align: "right" as const, render: (v: number) => Number(v).toFixed(2) },
    { title: "Retenido", dataIndex: "withheldAmount", key: "withheldAmount", align: "right" as const, render: (v: number) => Number(v).toFixed(2) },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Retenciones de ISLR</Title>
        <Space>
          <Button icon={<DatabaseOutlined />} onClick={() => seedMutation.mutate()} loading={seedMutation.isPending}>
            Cargar Conceptos Base
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
        title="Registrar Retencion de ISLR"
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="supplierId" label="Proveedor" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="children">
              {suppliers?.map((s: any) => (
                <Option key={s.id} value={s.id}>{s.legalName} ({s.rif})</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="islrConceptId" label="Concepto (Decreto 1808)" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="children">
              {concepts?.map((c: any) => (
                <Option key={c.id} value={c.id}>
                  {c.code} - {c.description} (J: {c.rateJuridica}%, N: {c.rateNatural}%)
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item name="voucherNumber" label="N Comprobante" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input placeholder="AAAAMMDD + XXXX" />
            </Form.Item>
            <Form.Item name="withholdingDate" label="Fecha" rules={[{ required: true }]} style={{ flex: 1 }}>
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item name="personType" label="Tipo Persona" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select>
                <Option value="JURIDICA">Jurídica</Option>
                <Option value="NATURAL">Natural</Option>
              </Select>
            </Form.Item>
            <Form.Item name="paymentAmount" label="Monto Pagado (Base)" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
            </Form.Item>
            <Form.Item name="sustraendoBs" label="Sustraendo (Bs)" initialValue={0} style={{ flex: 1 }}>
              <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
