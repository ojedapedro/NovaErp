import React from 'react';
import { Table, Typography, Tag, Button, Space, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { contabilidadApi } from '../../api/contabilidad';
import type { JournalEntry } from '../../api/contabilidad';
import { CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

export const Asientos: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: entries, isLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => contabilidadApi.getJournalEntries(),
  });

  const postMutation = useMutation({
    mutationFn: (id: string) => contabilidadApi.postJournalEntry(id),
    onSuccess: () => {
      message.success('Asiento contabilizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al contabilizar asiento');
    }
  });

  const columns = [
    {
      title: 'Número',
      dataIndex: 'number',
      key: 'number',
      render: (text: string) => <strong>#{text}</strong>,
    },
    {
      title: 'Fecha',
      dataIndex: 'entryDate',
      key: 'entryDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Concepto',
      dataIndex: 'concept',
      key: 'concept',
    },
    {
      title: 'Total (Bs)',
      key: 'total',
      render: (_: any, record: JournalEntry) => {
        const totalDebit = record.lines?.reduce((sum, line) => sum + Number(line.debit), 0) || 0;
        return <span>{totalDebit.toFixed(2)}</span>;
      }
    },
    {
      title: 'Estado',
      dataIndex: 'isPosted',
      key: 'isPosted',
      render: (isPosted: boolean) => (
        isPosted 
          ? <Tag color="green">Contabilizado</Tag> 
          : <Tag color="orange">Borrador</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: JournalEntry) => (
        <Space>
          <Button type="link">Ver Detalles</Button>
          {!record.isPosted && (
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />} 
              onClick={() => postMutation.mutate(record.id)}
              loading={postMutation.isPending}
            >
              Aprobar
            </Button>
          )}
        </Space>
      ),
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Libro Diario</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/contabilidad/asientos/nuevo')}>Nuevo Asiento</Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={entries} 
        rowKey="id" 
        loading={isLoading}
        expandable={{
          expandedRowRender: record => (
            <Table 
              dataSource={record.lines} 
              rowKey="id" 
              pagination={false}
              size="small"
              columns={[
                { title: 'Cuenta', dataIndex: ['account', 'name'], key: 'account' },
                { title: 'Debe', dataIndex: 'debit', key: 'debit', render: val => Number(val).toFixed(2) },
                { title: 'Haber', dataIndex: 'credit', key: 'credit', render: val => Number(val).toFixed(2) },
                { title: 'Descripción', dataIndex: 'description', key: 'description' },
              ]}
            />
          )
        }}
      />
    </div>
  );
};
