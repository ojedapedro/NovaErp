import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, Select, DatePicker, Row, Col, Space, InputNumber, Typography, Divider, Card, message, AutoComplete } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { comprasApi, PurchaseInvoice, Supplier } from "../../api/compras";
import { facturacionApi } from "../../api/facturacion";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

export const FacturasCompras = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [totals, setTotals] = useState({ subtotal: 0, taxAmount: 0, total: 0 });

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["purchaseInvoices"],
    queryFn: comprasApi.getPurchaseInvoices,
  });

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: comprasApi.getSuppliers,
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: facturacionApi.getProducts,
  });

  const createMutation = useMutation({
    mutationFn: comprasApi.createPurchaseInvoice,
    onSuccess: () => {
      message.success("Factura de compra registrada y stock actualizado");
      setIsModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["purchaseInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["kardex"] });
      queryClient.invalidateQueries({ queryKey: ["inventarioValorizado"] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || "Error al registrar la factura");
    },
  });

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.items) {
      let subtotal = 0;
      let taxAmount = 0;

      allValues.items?.forEach((item: any) => {
        const q = Number(item?.quantity) || 0;
        const p = Number(item?.unitPrice) || 0;
        const taxRate = item?.taxRate ?? 0.16; // default 16%
        
        const lineSubtotal = q * p;
        const lineTax = lineSubtotal * taxRate;

        subtotal += lineSubtotal;
        taxAmount += lineTax;
      });

      setTotals({
        subtotal,
        taxAmount,
        total: subtotal + taxAmount,
      });
    }
  };

  const handleSave = (values: any) => {
    if (!values.items || values.items.length === 0) {
      message.error("Debe agregar al menos un producto a la factura");
      return;
    }

    const dto = {
      supplierId: values.supplierId,
      invoiceNumber: values.invoiceNumber,
      controlNumber: values.controlNumber,
      invoiceDate: values.invoiceDate.toISOString(),
      currency: values.currency || "VES",
      notes: values.notes,
      items: values.items.map((item: any) => ({
        productCode: item.productCode,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
      })),
    };
    
    createMutation.mutate(dto);
  };

  const productOptions = products?.map(p => ({
    value: p.code,
    label: p.code + " - " + p.name,
    product: p
  })) || [];

  const handleProductSelect = (value: string, option: any, namePath: number) => {
    const items = form.getFieldValue('items');
    items[namePath] = {
      ...items[namePath],
      productCode: option.product.code,
      productName: option.product.name,
      taxRate: option.product.taxType === 'EXENTO' ? 0 : 0.16,
      unitPrice: option.product.lastCost || option.product.unitPrice
    };
    form.setFieldsValue({ items });
    handleValuesChange({ items }, form.getFieldsValue());
  };

  const columns = [
    {
      title: "Fecha",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Proveedor",
      key: "supplier",
      render: (_: any, r: PurchaseInvoice) => r.supplier?.legalName || r.supplierId,
    },
    { title: "N Factura", dataIndex: "invoiceNumber", key: "invoiceNumber" },
    { title: "N Control", dataIndex: "controlNumber", key: "controlNumber" },
    {
      title: "Base Imponible",
      dataIndex: "subtotal",
      key: "subtotal",
      align: "right" as const,
      render: (v: number) => Number(v).toFixed(2),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      align: "right" as const,
      render: (v: number) => <Text strong>{Number(v).toFixed(2)}</Text>,
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Gestion de Compras e Inventario</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Cargar Factura y Stock
        </Button>
      </div>
      <Card>
        <Table dataSource={invoices} columns={columns} rowKey="id" loading={isLoading} scroll={{ x: 900 }} size="small" />
      </Card>

      <Modal
        title={<Title level={4} style={{ margin: 0 }}>Cargar Factura de Compra</Title>}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); setTotals({ subtotal: 0, taxAmount: 0, total: 0 }); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        width={1000}
        okText="Guardar y Actualizar Stock"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" onFinish={handleSave} onValuesChange={handleValuesChange}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="supplierId" label="Proveedor" rules={[{ required: true, message: "Requerido" }]}>
                <Select showSearch optionFilterProp="children" placeholder="Seleccionar proveedor">
                  {suppliers?.map((s) => (
                    <Option key={s.id} value={s.id}>{s.legalName} ({s.rif})</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="invoiceDate" label="Fecha" rules={[{ required: true }]}>
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="currency" label="Moneda" initialValue="VES">
                <Select>
                  <Option value="VES">VES</Option>
                  <Option value="USD">USD</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="invoiceNumber" label="Num Factura" rules={[{ required: true }]}>
                <Input placeholder="Ej: 000001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="controlNumber" label="Num Control" rules={[{ required: true }]}>
                <Input placeholder="Ej: 00-000001" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Productos (Busca uno existente o escribe uno nuevo)</Divider>
          
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={8} style={{ marginBottom: 8 }} align="middle">
                    <Col span={4}>
                      <Form.Item {...restField} name={[name, 'productCode']} rules={[{ required: true, message: 'Falta código' }]} style={{ margin: 0 }}>
                        <AutoComplete
                          options={productOptions}
                          onSelect={(val, opt) => handleProductSelect(val, opt, name)}
                          placeholder="Código"
                          filterOption={(inputValue, option) =>
                            option!.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...restField} name={[name, 'productName']} rules={[{ required: true, message: 'Falta nombre' }]} style={{ margin: 0 }}>
                        <Input placeholder="Nombre del Producto" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item {...restField} name={[name, 'quantity']} rules={[{ required: true, message: 'Cant.' }]} style={{ margin: 0 }}>
                        <InputNumber placeholder="Cant." min={0.01} step={1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item {...restField} name={[name, 'unitPrice']} rules={[{ required: true, message: 'Precio' }]} style={{ margin: 0 }}>
                        <InputNumber placeholder="Costo Unit." min={0} step={0.01} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item {...restField} name={[name, 'taxRate']} initialValue={0.16} style={{ margin: 0 }}>
                        <Select>
                          <Option value={0.16}>IVA 16%</Option>
                          <Option value={0}>Exento</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={1}>
                      <DeleteOutlined onClick={() => remove(name)} style={{ color: 'red', cursor: 'pointer', fontSize: 18 }} />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ marginTop: 8 }}>
                    Añadir Producto
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Card size="small" style={{ backgroundColor: '#f9fafb', marginTop: 16 }}>
            <Row justify="end">
              <Col span={8}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>Subtotal:</Text>
                  <Text>{totals.subtotal.toFixed(2)} VES</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>IVA:</Text>
                  <Text>{totals.taxAmount.toFixed(2)} VES</Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: 16 }}>TOTAL:</Text>
                  <Text strong style={{ fontSize: 16, color: '#16a34a' }}>{totals.total.toFixed(2)} VES</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Form>
      </Modal>
    </div>
  );
};
