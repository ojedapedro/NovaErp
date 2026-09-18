import React, { useState } from "react";
import { Card, Typography, Table, Button, Space, Modal, Form, Select, DatePicker, Input, InputNumber, message, Tabs, Tag } from "antd";
import { PlusOutlined, CalculatorOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nominaApi } from "../../api/nomina";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

export const NominaBase: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Empleados State
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [empForm] = Form.useForm();
  
  // Períodos State
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [periodForm] = Form.useForm();

  const { data: employees, isLoading: loadingEmps } = useQuery({ queryKey: ["employees"], queryFn: nominaApi.getEmployees });
  const { data: periods, isLoading: loadingPeriods } = useQuery({ queryKey: ["payroll-periods"], queryFn: nominaApi.getPeriods });

  const empMutation = useMutation({
    mutationFn: nominaApi.createEmployee,
    onSuccess: () => {
      message.success("Empleado registrado");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsEmpModalOpen(false);
      empForm.resetFields();
    }
  });

  const periodMutation = useMutation({
    mutationFn: nominaApi.createPeriod,
    onSuccess: () => {
      message.success("Período creado");
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
      setIsPeriodModalOpen(false);
      periodForm.resetFields();
    }
  });

  const calcMutation = useMutation({
    mutationFn: nominaApi.calculatePayroll,
    onSuccess: () => {
      message.success("Cálculo de nómina generado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
    },
    onError: (e: any) => message.error(e.response?.data?.message || "Error al calcular nómina")
  });

  const empColumns = [
    { title: "Cédula", dataIndex: "cedula", key: "cedula" },
    { title: "Nombre Completo", key: "name", render: (_: any, r: any) => `${r.firstName} ${r.lastName}` },
    { title: "Cargo", dataIndex: "position", key: "position" },
    { title: "Sueldo Base", dataIndex: "baseSalary", key: "baseSalary", align: "right" as const, render: (v: number) => Number(v).toFixed(2) },
    { title: "Estatus", dataIndex: "status", key: "status", render: (v: string) => <Tag color={v === "ACTIVE" ? "green" : "red"}>{v}</Tag> },
  ];

  const periodColumns = [
    { title: "Nombre del Período", dataIndex: "periodName", key: "periodName" },
    { title: "Inicio", dataIndex: "startDate", key: "startDate", render: (v: string) => dayjs(v).format("DD/MM/YYYY") },
    { title: "Fin", dataIndex: "endDate", key: "endDate", render: (v: string) => dayjs(v).format("DD/MM/YYYY") },
    { title: "Estatus", dataIndex: "status", key: "status", render: (v: string) => <Tag color={v === "DRAFT" ? "orange" : "green"}>{v}</Tag> },
    { 
      title: "Acciones", 
      key: "actions",
      render: (_: any, r: any) => (
        <Space>
          {r.status === "DRAFT" && (
            <Button 
              size="small" 
              icon={<CalculatorOutlined />} 
              onClick={() => calcMutation.mutate(r.id)}
              loading={calcMutation.isPending}
            >
              Calcular
            </Button>
          )}
        </Space>
      )
    }
  ];

  const expandedRowRender = (period: any) => {
    const itemsColumns = [
      { title: "Empleado", key: "emp", render: (_: any, r: any) => employees?.find((e:any) => e.id === r.employeeId)?.firstName },
      { title: "Sueldo", dataIndex: "baseSalary", align: "right" as const, render: (v: number) => Number(v).toFixed(2) },
      { title: "IVSS (4%)", dataIndex: "deduccionIvss", align: "right" as const, render: (v: number) => Number(v).toFixed(2) },
      { title: "FAOV (1%)", dataIndex: "deduccionFaov", align: "right" as const, render: (v: number) => Number(v).toFixed(2) },
      { title: "INCES (0.5%)", dataIndex: "deduccionInces", align: "right" as const, render: (v: number) => Number(v).toFixed(2) },
      { title: "Neto a Pagar", dataIndex: "netoPagar", align: "right" as const, render: (v: number) => <strong>{Number(v).toFixed(2)}</strong> },
    ];
    return <Table columns={itemsColumns} dataSource={period.items} pagination={false} size="small" rowKey="id" />;
  };

  return (
    <div>
      <Title level={2}>Gestión de Nómina</Title>

      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Empleados" key="1">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsEmpModalOpen(true)} style={{ marginBottom: 16 }}>
              Nuevo Empleado
            </Button>
            <Table columns={empColumns} dataSource={employees} rowKey="id" loading={loadingEmps} size="small" />
          </TabPane>
          <TabPane tab="Cálculo de Nómina" key="2">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsPeriodModalOpen(true)} style={{ marginBottom: 16 }}>
              Nuevo Período
            </Button>
            <Table 
              columns={periodColumns} 
              dataSource={periods} 
              rowKey="id" 
              loading={loadingPeriods} 
              size="small" 
              expandable={{ expandedRowRender }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal Empleado */}
      <Modal title="Nuevo Empleado" open={isEmpModalOpen} onOk={() => empForm.submit()} onCancel={() => setIsEmpModalOpen(false)}>
        <Form form={empForm} layout="vertical" onFinish={(v) => empMutation.mutate({ ...v, hireDate: v.hireDate.toISOString() })}>
          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item name="cedula" label="Cédula" rules={[{ required: true }]} style={{ flex: 1 }}><Input /></Form.Item>
            <Form.Item name="baseSalary" label="Sueldo Base" rules={[{ required: true }]} style={{ flex: 1 }}><InputNumber style={{ width: "100%" }} min={0} step={0.01} /></Form.Item>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item name="firstName" label="Nombres" rules={[{ required: true }]} style={{ flex: 1 }}><Input /></Form.Item>
            <Form.Item name="lastName" label="Apellidos" rules={[{ required: true }]} style={{ flex: 1 }}><Input /></Form.Item>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item name="position" label="Cargo" rules={[{ required: true }]} style={{ flex: 1 }}><Input /></Form.Item>
            <Form.Item name="hireDate" label="Fecha Ingreso" rules={[{ required: true }]} style={{ flex: 1 }}><DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" /></Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Modal Período */}
      <Modal title="Nuevo Período de Nómina" open={isPeriodModalOpen} onOk={() => periodForm.submit()} onCancel={() => setIsPeriodModalOpen(false)}>
        <Form form={periodForm} layout="vertical" onFinish={(v) => periodMutation.mutate({ ...v, startDate: v.startDate.toISOString(), endDate: v.endDate.toISOString() })}>
          <Form.Item name="periodName" label="Nombre del Período (ej: 1era Quincena Oct 2026)" rules={[{ required: true }]}><Input /></Form.Item>
          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item name="startDate" label="Inicio" rules={[{ required: true }]} style={{ flex: 1 }}><DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" /></Form.Item>
            <Form.Item name="endDate" label="Fin" rules={[{ required: true }]} style={{ flex: 1 }}><DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" /></Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
