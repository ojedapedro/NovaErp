import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import PDFDocument from "pdfkit";

@Injectable()
export class RetencionesPdfService {
  constructor(private readonly prisma: PrismaService) {}

  async generateIvaWithholdingPdf(
    companyId: string,
    withholdingId: string
  ): Promise<Buffer> {
    // 1. Cargar datos completos de la retención
    const withholding = await this.prisma.ivaWithholding.findFirst({
      where: { id: withholdingId, companyId },
      include: {
        purchaseInvoice: {
          include: { supplier: true },
        },
        company: true,
      },
    });

    if (!withholding) {
      throw new NotFoundException("Comprobante de retención no encontrado");
    }

    const company = withholding.company;
    const invoice = withholding.purchaseInvoice;
    const supplier = invoice.supplier;

    // 2. Generar PDF
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const W = doc.page.width - 100; // ancho útil
      const primaryColor = "#1a3c6e";
      const accentColor = "#c0392b";

      // ─── ENCABEZADO ──────────────────────────────────────────────────────────
      doc.rect(50, 50, W, 80).fill(primaryColor);

      doc
        .fillColor("white")
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("COMPROBANTE DE RETENCIÓN DE IVA", 60, 62, { width: W - 20 });

      doc
        .fontSize(9)
        .font("Helvetica")
        .text(`Artículo 12 Providencia Administrativa SNAT/2013/0030`, 60, 82, {
          width: W - 20,
        });

      // Número de comprobante (destacado en rojo)
      doc.rect(50 + W - 180, 52, 178, 76).fill(accentColor);
      doc
        .fillColor("white")
        .fontSize(8)
        .font("Helvetica")
        .text("Nro. Comprobante", 50 + W - 175, 60, { width: 170, align: "center" });
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text(withholding.voucherNumber, 50 + W - 175, 74, {
          width: 170,
          align: "center",
        });
      doc
        .fontSize(8)
        .font("Helvetica")
        .text(
          `Fecha: ${new Date(withholding.withholdingDate).toLocaleDateString("es-VE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}`,
          50 + W - 175,
          96,
          { width: 170, align: "center" }
        );

      // ─── DATOS DEL AGENTE DE RETENCIÓN (EMPRESA) ─────────────────────────────
      let y = 155;
      doc
        .fillColor(primaryColor)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("AGENTE DE RETENCIÓN", 50, y);
      doc.moveTo(50, y + 12).lineTo(50 + W, y + 12).stroke(primaryColor);
      y += 18;

      doc.fillColor("#333").font("Helvetica").fontSize(9);
      const drawField = (label: string, value: string, x: number, colW: number, yPos: number) => {
        doc.font("Helvetica-Bold").fillColor("#555").text(label + ":", x, yPos, { width: colW });
        doc.font("Helvetica").fillColor("#222").text(value || "—", x, yPos + 11, { width: colW });
      };

      drawField("Razón Social", company.legalName, 50, W, y);
      y += 28;
      drawField("RIF", company.rif || "—", 50, W / 2 - 10, y);
      drawField("Dirección Fiscal", company.fiscalAddress || "—", 50 + W / 2 + 10, W / 2 - 10, y);
      y += 32;

      // ─── DATOS DEL PROVEEDOR RETENIDO ────────────────────────────────────────
      doc
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("PROVEEDOR RETENIDO", 50, y);
      doc.moveTo(50, y + 12).lineTo(50 + W, y + 12).stroke(primaryColor);
      y += 18;

      drawField("Razón Social", supplier.legalName, 50, W, y);
      y += 28;
      drawField("RIF", supplier.rif, 50, W / 2 - 10, y);
      drawField("Dirección", supplier.address || "—", 50 + W / 2 + 10, W / 2 - 10, y);
      y += 36;

      // ─── DATOS DE LA FACTURA ─────────────────────────────────────────────────
      doc
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("DATOS DEL DOCUMENTO RETENIDO", 50, y);
      doc.moveTo(50, y + 12).lineTo(50 + W, y + 12).stroke(primaryColor);
      y += 18;

      const colW3 = (W - 20) / 3;
      drawField("Nro. Factura", invoice.invoiceNumber, 50, colW3, y);
      drawField("Nro. Control", invoice.controlNumber, 50 + colW3 + 10, colW3, y);
      drawField("Fecha Factura", new Date(invoice.invoiceDate).toLocaleDateString("es-VE"), 50 + 2 * (colW3 + 10), colW3, y);
      y += 36;

      // ─── TABLA DE MONTOS ─────────────────────────────────────────────────────
      doc
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("CÁLCULO DE RETENCIÓN", 50, y);
      doc.moveTo(50, y + 12).lineTo(50 + W, y + 12).stroke(primaryColor);
      y += 20;

      // Cabecera tabla
      const tableLeft = 50;
      const col1 = 220, col2 = 130, col3 = 130;
      doc.rect(tableLeft, y, col1 + col2 + col3, 18).fill("#e8edf5");
      doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(8);
      doc.text("Concepto", tableLeft + 5, y + 5, { width: col1 - 5 });
      doc.text("Alícuota / %", tableLeft + col1 + 5, y + 5, { width: col2 - 5, align: "right" });
      doc.text("Monto (Bs.)", tableLeft + col1 + col2 + 5, y + 5, { width: col3 - 10, align: "right" });
      y += 18;

      const tableRow = (label: string, pct: string, amount: string, shade: boolean) => {
        if (shade) doc.rect(tableLeft, y, col1 + col2 + col3, 18).fill("#f7f9fc");
        doc.fillColor("#333").font("Helvetica").fontSize(8);
        doc.text(label, tableLeft + 5, y + 5, { width: col1 - 5 });
        doc.text(pct, tableLeft + col1 + 5, y + 5, { width: col2 - 5, align: "right" });
        doc.text(amount, tableLeft + col1 + col2 + 5, y + 5, { width: col3 - 10, align: "right" });
        y += 18;
      };

      tableRow("Base Imponible", "—", Number(withholding.baseAmount).toFixed(2), false);
      tableRow("IVA del Proveedor (16%)", "16%", Number(withholding.ivaAmount).toFixed(2), true);
      tableRow(`Porcentaje de Retención`, `${Number(withholding.withholdingPct)}%`, "—", false);

      // Fila de total retenido
      y += 2;
      doc.rect(tableLeft, y, col1 + col2 + col3, 22).fill(accentColor);
      doc.fillColor("white").font("Helvetica-Bold").fontSize(9);
      doc.text("MONTO RETENIDO", tableLeft + 5, y + 6, { width: col1 + col2 - 10 });
      doc.text(
        `Bs. ${Number(withholding.withheldAmount).toFixed(2)}`,
        tableLeft + col1 + col2 + 5,
        y + 6,
        { width: col3 - 10, align: "right" }
      );
      y += 32;

      // ─── NOTA LEGAL ───────────────────────────────────────────────────────────
      doc
        .fillColor("#777")
        .font("Helvetica")
        .fontSize(7)
        .text(
          `Este comprobante es emitido en cumplimiento de la Providencia Administrativa SNAT/2013/0030 publicada en Gaceta Oficial Nro. 40.170 del 20/05/2013. ` +
          `El agente de retención deberá entregarlo al proveedor dentro de los tres (3) días hábiles siguientes a la retención.`,
          50,
          y,
          { width: W, align: "justify" }
        );

      y += 35;

      // ─── FIRMA ────────────────────────────────────────────────────────────────
      const sigX = 50 + W / 2 - 80;
      doc.moveTo(sigX, y + 25).lineTo(sigX + 160, y + 25).stroke("#999");
      doc
        .fillColor("#555")
        .font("Helvetica")
        .fontSize(8)
        .text("Firma y Sello del Agente de Retención", sigX - 10, y + 30, { width: 180, align: "center" });

      // ─── PIE ─────────────────────────────────────────────────────────────────
      doc
        .fillColor(primaryColor)
        .rect(50, doc.page.height - 60, W, 20)
        .fill(primaryColor);
      doc
        .fillColor("white")
        .font("Helvetica")
        .fontSize(7)
        .text(
          `Generado por NovaERP | ${new Date().toLocaleString("es-VE")} | Comprobante Nro. ${withholding.voucherNumber}`,
          60,
          doc.page.height - 55,
          { width: W - 20, align: "center" }
        );

      doc.end();
    });
  }
}
