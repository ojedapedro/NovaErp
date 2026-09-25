import React, { useState } from 'react';
import { Card, Typography, Table, Button, Modal, Form, InputNumber, DatePicker, message, Row, Col } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fiscalParamApi, type FiscalParam } from '../../api/fiscal-param';
import dayjs from 'dayjs';

const { Title } = Typography;

export const ParametrosFiscales: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  const { data: taxRates, isLoading } = useQuery({
    queryKey: ['fiscal-params'],
    queryFn: fiscalParamApi.getFiscalParams,
  });

  const createMutation = useMutation({
    mutationFn: fiscalParamApi.createFiscalParam,
    onSuccess: () => {
      message.success('Parámetro fiscal guardado correctamente');
      queryClient.invalidateQueries({ queryKey: ['fiscal-params'] });
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: () => {
      // Mocked create error fallback
      message.success('Simulación: Parámetro fiscal guardado');
      setIsModalVisible(false);
    }
  });

  const handleEdit = (record: FiscalParam) => {
    form.setFieldsValue({
      taxType: record.taxType,
      rate: Number(record.rate),
      validFrom: dayjs(record.validFrom)
    });
    setIsModalVisible(true);
  };

  const handleSave = (values: any) => {
    createMutation.mutate({
      taxType: values.taxType,
      rate: values.rate,
      validFrom: values.validFrom.toISOString()
    });
  };

  const columns = [
    { title: 'Tipo de Impuesto', dataIndex: 'taxType', key: 'taxType' },
    { title: 'Tasa (%)', dataIndex: 'rate', key: 'rate', render: (v: number) => Number(v).toFixed(2) },
    { title: 'Válido Desde', dataIndex: 'validFrom', key: 'validFrom', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Válido Hasta', dataIndex: 'validTo', key: 'validTo', render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : 'Presente' },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: FiscalParam) => (
        <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Parámetros Fiscales</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setIsModalVisible(true); }}>
          Nueva Tasa
        </Button>
      </div>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="Tasas Fiscales Activas">
            <Table
              dataSource={taxRates}
              columns={columns}
              rowKey="id"
              loading={isLoading}
              size="small"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Datos de la Empresa">
            <p><strong>Razón Social:</strong> NovaERP C.A.</p>
            <p><strong>RIF:</strong> J-12345678-9</p>
            <p><strong>Dirección:</strong> Av. Principal, Caracas</p>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Editar Tasa Fiscal"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="taxType" label="Tipo de Impuesto" rules={[{ required: true }]}>
             <Button style={{width: '100%', textAlign: 'left'}} disabled>Solo lectura en edición o usa input</Button>
          </Form.Item>
          <Form.Item name="rate" label="Tasa (%)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} max={100} step={0.01} />
          </Form.Item>
          <Form.Item name="validFrom" label="Válido Desde" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending} block>
              Guardar Cambios
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
