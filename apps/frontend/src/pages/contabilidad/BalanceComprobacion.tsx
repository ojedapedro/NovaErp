import React, { useState } from 'react';
import { Table, Typography, Card, DatePicker, Button, Space } from 'antd';
import { SearchOutlined, PrinterOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { contabilidadApi } from '../../api/contabilidad';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const BalanceComprobacion: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);

  const { data: balanceData, isLoading, refetch } = useQuery({
    queryKey: ['trial-balance', dateRange[0].format('YYYY-MM-DD'), dateRange[1].format('YYYY-MM-DD')],
    queryFn: () => contabilidadApi.getTrialBalance(
      dateRange[0].format('YYYY-MM-DD'),
      dateRange[1].format('YYYY-MM-DD')
    ),
  });

  const columns = [
    {
      title: 'Código',
      dataIndex: 'accountCode',
      key: 'accountCode',
      width: '15%',
    },
    {
      title: 'Cuenta',
      dataIndex: 'accountName',
      key: 'accountName',
    },
    {
      title: 'Débitos',
      dataIndex: 'totalDebit',
      key: 'totalDebit',
      align: 'right' as const,
      render: (val: number) => val > 0 ? val.toFixed(2) : '-',
    },
    {
      title: 'Créditos',
      dataIndex: 'totalCredit',
      key: 'totalCredit',
      align: 'right' as const,
      render: (val: number) => val > 0 ? val.toFixed(2) : '-',
    },
    {
      title: 'Saldo Deudor',
      key: 'debitBalance',
      align: 'right' as const,
      render: (_: any, record: any) => {
        return record.balance > 0 ? record.balance.toFixed(2) : '-';
      }
    },
    {
      title: 'Saldo Acreedor',
      key: 'creditBalance',
      align: 'right' as const,
      render: (_: any, record: any) => {
        return record.balance < 0 ? Math.abs(record.balance).toFixed(2) : '-';
      }
    },
  ];

  // Totales
  const totalDebits = balanceData?.reduce((acc, row) => acc + (row.totalDebit || 0), 0) || 0;
  const totalCredits = balanceData?.reduce((acc, row) => acc + (row.totalCredit || 0), 0) || 0;
  
  const totalDebitBalance = balanceData?.reduce((acc, row) => acc + (row.balance > 0 ? row.balance : 0), 0) || 0;
  const totalCreditBalance = balanceData?.reduce((acc, row) => acc + (row.balance < 0 ? Math.abs(row.balance) : 0), 0) || 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Balance de Comprobación</Title>
        <Space>
          <Button icon={<PrinterOutlined />}>Imprimir</Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space size="middle">
          <Text strong>Período:</Text>
          <RangePicker 
            value={dateRange} 
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0], dates[1]]);
              }
            }}
            format="DD/MM/YYYY" 
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={() => refetch()}>
            Generar Balance
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          dataSource={balanceData?.filter(r => r.totalDebit > 0 || r.totalCredit > 0 || r.balance !== 0)}
          columns={columns}
          rowKey="accountCode"
          loading={isLoading}
          pagination={false}
          size="middle"
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row style={{ fontWeight: 'bold', background: '#fafafa' }}>
                <Table.Summary.Cell index={0} colSpan={2}>
                  TOTALES
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  {totalDebits.toFixed(2)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  {totalCredits.toFixed(2)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  {totalDebitBalance.toFixed(2)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  {totalCreditBalance.toFixed(2)}
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  );
};
