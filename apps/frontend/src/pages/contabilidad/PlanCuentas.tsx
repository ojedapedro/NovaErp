import React from 'react';
import { Table, Typography, Tag, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { contabilidadApi } from '../../api/contabilidad';

const { Title } = Typography;

export const PlanCuentas: React.FC = () => {
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => contabilidadApi.getAccounts(),
  });

  // Transformar lista plana a árbol jerárquico
  const buildTree = (items: any[], parentId = null) => {
    return items
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        key: item.id,
        children: buildTree(items, item.id).length ? buildTree(items, item.id) : undefined,
      }));
  };

  const treeData = accounts ? buildTree(accounts) : [];

  const columns = [
    {
      title: 'Código',
      dataIndex: 'code',
      key: 'code',
      width: '20%',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Nombre de la Cuenta',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      width: '15%',
    },
    {
      title: 'Control/Detalle',
      dataIndex: 'isControl',
      key: 'isControl',
      width: '15%',
      render: (isControl: boolean) => (
        <Tag color={isControl ? 'blue' : 'green'}>
          {isControl ? 'Control' : 'Movimiento'}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Plan de Cuentas</Title>
      </div>
      <Table 
        columns={columns} 
        dataSource={treeData} 
        loading={isLoading}
        pagination={false}
        size="small"
        expandable={{ defaultExpandAllRows: false }}
      />
    </div>
  );
};
