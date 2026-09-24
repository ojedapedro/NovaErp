import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, Select, DatePicker, Row, Col, InputNumber, Typography, Divider, Card, message, AutoComplete, Tag } from "antd";
import { PlusOutlined, DeleteOutlined, AppstoreAddOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { comprasApi } from "../../api/compras";
import type { PurchaseInvoice } from "../../api/compras";
import { facturacionApi } from "../../api/facturacion";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

export const FacturasCompras = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [form] = Form.useForm();
  const [newProductForm] = Form.useForm();
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
      setTotals({ subtotal: 0, taxAmount: 0, total: 0 });
      queryClient.invalidateQueries({ queryKey: ["purchaseInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["kardex"] });
      queryClient.invalidateQueries({ queryKey: ["inventarioValorizado"] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || "Error al registrar la factura");
    },
  });

  const createProductMutation = useMutation({
    mutationFn: (dto: any) => facturacionApi.createProduct(dto),
    onSuccess: (newProduct) => {
      message.success("Producto creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsNewProductOpen(false);
      newProductForm.resetFields();
      // Auto-add the new product as a line in the invoice form
      const currentItems = form.getFieldValue("items") || [];
      form.setFieldsValue({
        items: [
          ...currentItems,
          {
            productCode: newProduct.code,
            productName: newProduct.name,
            taxRate: newProduct.taxType === "EXENTO" ? 0 : 0.16,
            unitPrice: undefined,
            quantity: undefined,
          },
        ],
      });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || "Error al crear el producto");
    },
  });

  const handleValuesChange = (_: any, allValues: any) => {
    let subtotal = 0;
    let taxAmount = 0;
    allValues.items?.forEach((item: any) => {
      const q = Number(item?.quantity) || 0;
      const p = Number(item?.unitPrice) || 0;
      const taxRate = item?.taxRate ?? 0.16;
      const lineSub = q * p;
      subtotal += lineSub;
      taxAmount += lineSub * taxRate;
    });
    setTotals({ subtotal, taxAmount, total: subtotal + taxAmount });
  };

  const handleSave = (values: any) => {
    if (!values.items || values.items.length === 0) {
      message.error("Debe agregar al menos un producto a la factura");
      return;
    }
    createMutation.mutate({
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
    });
  };

  const productOptions = products?.map((p) => ({
    value: p.code,
    label: p.code + " - " + p.name,
    product: p,
  })) || [];

  const handleProductSelect = (val: string, opt: any, namePath: number) => {
    const items = form.getFieldValue("items");
    items[namePath] = {
      ...items[namePath],
      productCode: opt.product.code,
      productName: opt.product.name,
      taxRate: opt.product.taxType === "EXENTO" ? 0 : 0.16,
      unitPrice: (opt.product as any).lastCost || opt.product.unitPrice,
    };
    form.setFieldsValue({ items });
    handleValuesChange({}, form.getFieldsValue());
  };

  const handleCreateProduct = (values: any) => {
    createProductMutation.mutate({
      code: values.code,
      name: values.name,
      description: values.description,
      unitPrice: values.unitPrice,
      unitMeasure: values.unitMeasure || "UND",
      taxType: values.taxType || "IVA_GENERAL",
    });
  };

  const columns = [
    { title: "Fecha", dataIndex: "invoiceDate", key: "invoiceDate", render: (v: string) => dayjs(v).format("DD/MM/YYYY") },
    { title: "Proveedor", key: "supplier", render: (_: any, r: PurchaseInvoice) => r.supplier?.legalName || r.supplierId },
    { title: "N Factura", dataIndex: "invoiceNumber", key: "invoiceNumber" },
    { title: "N Control", dataIndex: "controlNumber", key: "controlNumber" },
    { title: "Base Imp.", dataIndex: "subtotal", key: "subtotal", align: "right" as const, render: (v: number) => Number(v).toFixed(2) },
    { title: "IVA", dataIndex: "taxAmount", key: "taxAmount", align: "right" as const, render: (v: number) => Number(v).toFixed(2) },
    { title: "Total", dataIndex: "total", key: "total", align: "right" as const, render: (v: number) => <Text strong>{Number(v).toFixed(2)}</Text> },
    { title: "Estado", dataIndex: "status", key: "status", render: (s: string) => <Tag color={s === "VOID" ? "red" : "green"}>{s}</Tag> },
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

      {/* â”€â”€ MAIN PURCHASE INVOICE MODAL â”€â”€ */}
      <Modal
        title={<Title level={4} style={{ margin: 0 }}>Cargar Factura de Compra</Title>}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); setTotals({ subtotal: 0, taxAmount: 0, total: 0 }); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        width={1050}
        okText="Guardar y Actualizar Stock"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" onFinish={handleSave} onValuesChange={handleValuesChange}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="supplierId" label="Proveedor" rules={[{ required: true, message: "Requerido" }]}>
                <Select showSearch optionFilterProp="children" placeholder="Seleccionar proveedor">
                  {suppliers?.map((s) => <Option key={s.id} value={s.id}>{s.legalName} ({s.rif})</Option>)}
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
              <Form.Item name="invoiceNumber" label="N de Factura" rules={[{ required: true }]}>
                <Input placeholder="Ej: 000001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="controlNumber" label="N de Control" rules={[{ required: true }]}>
                <Input placeholder="Ej: 00-000001" />
              </Form.Item>
            </Col>
          </Row>

          {/* Header de columnas + boton Nuevo Producto */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text strong style={{ color: "#4b5563" }}>Productos de la Factura (Ingreso a Inventario)</Text>
            <Button
              size="small"
              icon={<AppstoreAddOutlined />}
              onClick={() => setIsNewProductOpen(true)}
              style={{ borderColor: "#2563eb", color: "#2563eb" }}
            >
              Nuevo Producto al Catalogo
            </Button>
          </div>

          {/* Column labels */}
          <Row gutter={8} style={{ marginBottom: 4 }}>
            <Col span={4}><Text type="secondary" style={{ fontSize: 12 }}>Codigo</Text></Col>
            <Col span={8}><Text type="secondary" style={{ fontSize: 12 }}>Nombre del Producto</Text></Col>
            <Col span={4}><Text type="secondary" style={{ fontSize: 12 }}>Cantidad</Text></Col>
            <Col span={4}><Text type="secondary" style={{ fontSize: 12 }}>Costo Unit.</Text></Col>
            <Col span={3}><Text type="secondary" style={{ fontSize: 12 }}>IVA</Text></Col>
          </Row>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={8} style={{ marginBottom: 6 }} align="middle">
                    <Col span={4}>
                      <Form.Item {...restField} name={[name, "productCode"]} rules={[{ required: true, message: "Cod." }]} style={{ margin: 0 }}>
                        <AutoComplete
                          options={productOptions}
                          onSelect={(val, opt) => handleProductSelect(val, opt, name)}
                          placeholder="Codigo"
                          filterOption={(input, opt) => opt!.label.toUpperCase().includes(input.toUpperCase())}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...restField} name={[name, "productName"]} rules={[{ required: true, message: "Nombre" }]} style={{ margin: 0 }}>
                        <Input placeholder="Nombre del Producto" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item {...restField} name={[name, "quantity"]} rules={[{ required: true, message: "Cant." }]} style={{ margin: 0 }}>
                        <InputNumber placeholder="Cant." min={0.01} step={1} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item {...restField} name={[name, "unitPrice"]} rules={[{ required: true, message: "Precio" }]} style={{ margin: 0 }}>
                        <InputNumber placeholder="0.00" min={0} step={0.01} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item {...restField} name={[name, "taxRate"]} initialValue={0.16} style={{ margin: 0 }}>
                        <Select>
                          <Option value={0.16}>16%</Option>
                          <Option value={0}>Exento</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={1}>
                      <DeleteOutlined onClick={() => remove(name)} style={{ color: "#ef4444", cursor: "pointer", fontSize: 16 }} />
                    </Col>
                  </Row>
                ))}
                <Form.Item style={{ marginTop: 8 }}>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    AÃ±adir linea de Producto
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Card size="small" style={{ backgroundColor: "#f9fafb", marginTop: 8 }}>
            <Row justify="end">
              <Col span={8}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text>Subtotal:</Text><Text>{totals.subtotal.toFixed(2)} VES</Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text>IVA:</Text><Text>{totals.taxAmount.toFixed(2)} VES</Text>
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong style={{ fontSize: 16 }}>TOTAL:</Text>
                  <Text strong style={{ fontSize: 16, color: "#16a34a" }}>{totals.total.toFixed(2)} VES</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Form>
      </Modal>

      {/* â”€â”€ QUICK CREATE PRODUCT MODAL â”€â”€ */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AppstoreAddOutlined style={{ color: "#2563eb" }} />
            <span>Agregar Nuevo Producto al Catalogo</span>
          </div>
        }
        open={isNewProductOpen}
        onCancel={() => { setIsNewProductOpen(false); newProductForm.resetFields(); }}
        onOk={() => newProductForm.submit()}
        confirmLoading={createProductMutation.isPending}
        width={520}
        okText="Crear Producto"
        cancelText="Cancelar"
      >
        <Form form={newProductForm} layout="vertical" onFinish={handleCreateProduct} style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={10}>
              <Form.Item name="code" label="Codigo" rules={[{ required: true, message: "Requerido" }]}>
                <Input placeholder="Ej: PROD-001" style={{ textTransform: "uppercase" }} />
              </Form.Item>
            </Col>
            <Col span={14}>
              <Form.Item name="name" label="Nombre del Producto" rules={[{ required: true, message: "Requerido" }]}>
                <Input placeholder="Ej: Cemento Portland 42.5" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Descripcion (Opcional)">
            <Input.TextArea rows={2} placeholder="Descripcion breve del producto..." />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="unitMeasure" label="Unidad" initialValue="UND">
                <Select>
                  <Option value="UND">UND</Option>
                  <Option value="KG">KG</Option>
                  <Option value="LT">LT</Option>
                  <Option value="MT">MT</Option>
                  <Option value="CJ">CJ</Option>
                  <Option value="PAQ">PAQ</Option>
                  <Option value="TON">TON</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="taxType" label="Tipo IVA" initialValue="IVA_GENERAL">
                <Select>
                  <Option value="IVA_GENERAL">Gravado 16%</Option>
                  <Option value="EXENTO">Exento</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unitPrice" label="Precio Venta" rules={[{ required: true, message: "Requerido" }]}>
                <InputNumber min={0} step={0.01} style={{ width: "100%" }} placeholder="0.00" />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "8px 12px", marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              El costo de compra y stock se actualizaran automaticamente al guardar la factura de compra.
            </Text>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
