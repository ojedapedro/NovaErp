import React from "react";
import { Card, Typography, Table, Row, Col, Statistic, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { cxpApi } from "../../api/cxp";
import dayjs from "dayjs";

const { Title } = Typography;

export const AgingCxP: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["cxp-aging"],
    queryFn: cxpApi.getAging,
  });

  const summary = data?.summary || { "0-30": 0, "31-60": 0, "61-90": 0, "+90": 0, total: 0 };
  const details = data?.details || [];

  const formatCurrency = (val: number) => `$${Number(val).toFixed(2)}`;

  const columns = [
    { title: "Factura", dataIndex: "controlNumber", key: "controlNumber" },
    { title: "Proveedor", key: "supplier", render: (_: any, r: any) => r.supplier?.legalName },
    { title: "Fecha Emisión", dataIndex: "invoiceDate", key: "invoiceDate", render: (v: string) => dayjs(v).format("DD/MM/YYYY") },
    { title: "Días por Vencer", dataIndex: "diffDays", key: "diffDays", align: "right" as const },
    { 
      title: "Rango", 
      dataIndex: "category", 
      key: "category",
      render: (v: string) => {
        let color = "green";
        if (v === "31-60") color = "gold";
        if (v === "61-90") color = "orange";
        if (v === "+90") color = "red";
        return <Tag color={color}>{v} días</Tag>;
      }
    },
    { title: "Deuda Pendiente", dataIndex: "balance", key: "balance", align: "right" as const, render: formatCurrency },
  ];

  return (
    <div>
      <Title level={2}>Antigüedad de Cuentas por Pagar (Aging)</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card bordered={false}>
            <Statistic title="0 a 30 días" value={summary["0-30"]} precision={2} prefix="$" valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card bordered={false}>
            <Statistic title="31 a 60 días" value={summary["31-60"]} precision={2} prefix="$" valueStyle={{ color: '#cfba19' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card bordered={false}>
            <Statistic title="61 a 90 días" value={summary["61-90"]} precision={2} prefix="$" valueStyle={{ color: '#cf6a19' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card bordered={false}>
            <Statistic title="Más de 90 días" value={summary["+90"]} precision={2} prefix="$" valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#fafafa' }}>
            <Statistic title="DEUDA TOTAL POR PAGAR" value={summary.total} precision={2} prefix="$" valueStyle={{ fontWeight: 'bold' }} />
          </Card>
        </Col>
      </Row>

      <Card title="Detalle de Facturas Pendientes">
        <Table 
          dataSource={details} 
          columns={columns} 
          rowKey="id" 
          loading={isLoading}
          size="small"
        />
      </Card>
    </div>
  );
};
