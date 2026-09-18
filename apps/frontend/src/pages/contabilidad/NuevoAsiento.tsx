import React, { useState } from 'react';
import { Form, Input, DatePicker, Button, Table, Select, Typography, Space, message, Card, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { contabilidadApi } from '../../api/contabilidad';
import type { JournalEntryLine } from '../../api/contabilidad';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const NuevoAsiento: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [lines, setLines] = useState<JournalEntryLine[]>([
    { accountId: '', debit: 0, credit: 0, description: '' },
    { accountId: '', debit: 0, credit: 0, description: '' }
  ]);

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => contabilidadApi.getAccounts(),
  });

  const createMutation = useMutation({
    mutationFn: (values: any) => contabilidadApi.createJournalEntry(values),
    onSuccess: () => {
      message.success('Asiento registrado exitosamente como Borrador');
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      navigate('/contabilidad/asientos');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al guardar el asiento');
    }
  });

  const totalDebit = lines.reduce((acc, curr) => acc + (curr.debit || 0), 0);
  const totalCredit = lines.reduce((acc, curr) => acc + (curr.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleAddLine = () => {
    setLines([...lines, { accountId: '', debit: 0, credit: 0, description: '' }]);
  };

  const handleRemoveLine = (index: number) => {
    const newLines = lines.filter((_, i) => i !== index);
    setLines(newLines);
  };

  const updateLine = (index: number, field: keyof JournalEntryLine, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    // Si se escribe en Debe, borrar Haber (y viceversa) para no confundir, aunque la API soporte ambos
    if (field === 'debit' && value > 0) newLines[index].credit = 0;
    if (field === 'credit' && value > 0) newLines[index].debit = 0;
    setLines(newLines);
  };

  const onFinish = (values: any) => {
    if (!isBalanced) {
      message.error('El asiento no está cuadrado. Debe y Haber deben ser iguales.');
      return;
    }
    const invalidLines = lines.some(l => !l.accountId || (l.debit === 0 && l.credit === 0));
    if (invalidLines) {
      message.error('Hay líneas incompletas. Seleccione cuenta y un monto.');
      return;
    }
    
    const payload = {
      entryDate: values.entryDate.format('YYYY-MM-DD'),
      concept: values.concept,
      lines: lines.map(l => ({
        accountId: l.accountId,
        debit: Number(l.debit),
        credit: Number(l.credit),
        description: l.description || values.concept
      }))
    };

    createMutation.mutate(payload);
  };

  // Solo mostramos cuentas de movimiento (isControl = false)
  const movementAccounts = accounts?.filter(a => !a.isControl) || [];

  const columns = [
    {
      title: 'Cuenta Contable',
      dataIndex: 'accountId',
      width: '35%',
      render: (_: any, __: any, index: number) => (
        <Select
          showSearch
          style={{ width: '100%' }}
          placeholder="Buscar cuenta"
          optionFilterProp="children"
          value={lines[index].accountId || undefined}
          onChange={(val) => updateLine(index, 'accountId', val)}
          options={movementAccounts.map(a => ({ label: `${a.code} - ${a.name}`, value: a.id }))}
        />
      ),
    },
    {
      title: 'Descripción (Opcional)',
      dataIndex: 'description',
      width: '25%',
      render: (_: any, __: any, index: number) => (
        <Input 
          placeholder="Referencia" 
          value={lines[index].description}
          onChange={(e) => updateLine(index, 'description', e.target.value)}
        />
      ),
    },
    {
      title: 'Debe',
      dataIndex: 'debit',
      width: '15%',
      render: (_: any, __: any, index: number) => (
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          precision={2}
          value={lines[index].debit}
          onChange={(val) => updateLine(index, 'debit', val || 0)}
        />
      ),
    },
    {
      title: 'Haber',
      dataIndex: 'credit',
      width: '15%',
      render: (_: any, __: any, index: number) => (
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          precision={2}
          value={lines[index].credit}
          onChange={(val) => updateLine(index, 'credit', val || 0)}
        />
      ),
    },
    {
      title: '',
      key: 'action',
      width: '10%',
      render: (_: any, __: any, index: number) => (
        <Button danger icon={<DeleteOutlined />} onClick={() => handleRemoveLine(index)} disabled={lines.length <= 2} />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Nuevo Asiento Contable</Title>
        <Button onClick={() => navigate('/contabilidad/asientos')}>Volver al Diario</Button>
      </div>

      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ entryDate: dayjs() }}>
          <Space size="large" style={{ display: 'flex', marginBottom: 16 }}>
            <Form.Item name="entryDate" label="Fecha del Asiento" rules={[{ required: true }]}>
              <DatePicker format="DD/MM/YYYY" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="concept" label="Concepto General" style={{ width: 400 }} rules={[{ required: true, message: 'Ingrese el concepto' }]}>
              <Input placeholder="Ej. Ventas del día, Pago de nómina" />
            </Form.Item>
          </Space>

          <Table
            dataSource={lines}
            columns={columns}
            pagination={false}
            rowKey={(record, index) => index?.toString() || Math.random().toString()}
            footer={() => (
              <Button type="dashed" onClick={handleAddLine} block icon={<PlusOutlined />}>
                Agregar Línea
              </Button>
            )}
          />

          <div style={{ marginTop: 24, padding: 16, background: '#fafafa', borderRadius: 8, display: 'flex', justifyContent: 'flex-end', gap: 48 }}>
            <div style={{ textAlign: 'right' }}>
              <Text type="secondary">Total Debe</Text>
              <Title level={4} style={{ margin: 0, color: isBalanced ? '#3f8600' : '#cf1322' }}>{totalDebit.toFixed(2)}</Title>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Text type="secondary">Total Haber</Text>
              <Title level={4} style={{ margin: 0, color: isBalanced ? '#3f8600' : '#cf1322' }}>{totalCredit.toFixed(2)}</Title>
            </div>
          </div>

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => navigate('/contabilidad/asientos')}>Cancelar</Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} disabled={!isBalanced} loading={createMutation.isPending}>
                Guardar Borrador
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};
