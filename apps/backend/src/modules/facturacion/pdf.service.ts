import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import PDFDocument from "pdfkit";
import * as QRCode from "qrcode";
import { Writable } from "stream";

@Injectable()
export class PdfService {
  constructor(private readonly prisma: PrismaService) {}

  async generateInvoicePdf(invoiceId: string, companyId: string, stream: Writable): Promise<void> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        company: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!invoice || invoice.companyId !== companyId) {
      throw new Error("Factura no encontrada");
    }

    const doc = new PDFDocument({ margin: 50, size: "LETTER" });
    doc.pipe(stream);

    // 1. Header (Datos de la empresa)
    doc.fontSize(20).text(invoice.company.legalName, { align: "center" });
    doc.fontSize(10).text(`RIF: ${invoice.company.rif}`, { align: "center" });
    doc.moveDown();

    // 2. Info de Factura
    doc.fontSize(14).text("FACTURA", { align: "right" });
    doc.fontSize(10).text(`N°: ${String(invoice.number).padStart(6, "0")}`, { align: "right" });
    doc.text(`N° Control: ${invoice.controlNumber || String(invoice.number).padStart(6, "0")}`, { align: "right" });
    doc.text(`Fecha: ${invoice.invoiceDate.toLocaleDateString()}`, { align: "right" });
    doc.moveDown();

    // 3. Info del Cliente
    doc.fontSize(12).text("Datos del Cliente:");
    doc.fontSize(10).text(`Razón Social: ${invoice.customer.legalName}`);
    doc.text(`RIF: ${invoice.customer.rif}`);
    doc.text(`Dirección: ${invoice.customer.address || "N/A"}`);
    doc.moveDown();

    // 4. Tabla de items
    const tableTop = doc.y;
    doc.font("Helvetica-Bold");
    doc.text("Descripción", 50, tableTop);
    doc.text("Cant", 300, tableTop);
    doc.text("Precio", 350, tableTop, { width: 90, align: "right" });
    doc.text("Total", 450, tableTop, { width: 90, align: "right" });
    doc.font("Helvetica");

    let y = tableTop + 20;
    for (const item of invoice.items) {
      doc.text(item.product.name, 50, y);
      doc.text(item.quantity.toString(), 300, y);
      doc.text(Number(item.unitPrice).toFixed(2), 350, y, { width: 90, align: "right" });
      doc.text(Number(item.total).toFixed(2), 450, y, { width: 90, align: "right" });
      y += 20;
    }

    // 5. Totales
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;
    
    doc.text("Subtotal:", 350, y, { width: 90, align: "right" });
    doc.text(Number(invoice.subtotal).toFixed(2), 450, y, { width: 90, align: "right" });
    y += 20;

    doc.text("IVA (16%):", 350, y, { width: 90, align: "right" });
    doc.text(Number(invoice.taxAmount).toFixed(2), 450, y, { width: 90, align: "right" });
    y += 20;

    if (Number(invoice.igtfAmount) > 0) {
      doc.text("IGTF (3%):", 350, y, { width: 90, align: "right" });
      doc.text(Number(invoice.igtfAmount).toFixed(2), 450, y, { width: 90, align: "right" });
      y += 20;
    }

    doc.font("Helvetica-Bold");
    doc.text("TOTAL:", 350, y, { width: 90, align: "right" });
    doc.text(Number(invoice.total).toFixed(2), 450, y, { width: 90, align: "right" });
    doc.font("Helvetica");
    y += 40;

    // 6. Código QR (Providencia 000102)
    // QR con link al validador del SENIAT (simulado)
    const qrData = `https://seniat.gob.ve/validador?rif=${invoice.company.rif}&fact=${invoice.number}&fecha=${invoice.invoiceDate.toISOString().split('T')[0]}&total=${invoice.total}`;
    
    try {
      const qrImage = await QRCode.toDataURL(qrData, { margin: 1 });
      // Insertar QR
      doc.image(qrImage, 50, y, { width: 100 });
      doc.fontSize(8).text("Firma Electrónica / Providencia 0102", 160, y + 50);
    } catch (e) {
      console.error("Error generando QR", e);
    }

    // Finalizar PDF
    doc.end();
  }
}
