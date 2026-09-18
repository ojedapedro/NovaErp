import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";

@Injectable()
export class RetencionesService {
  constructor(private readonly prisma: PrismaService) {}

  // ================= RETENCIONES DE IVA =================
  async getIvaWithholdings(companyId: string) {
    return this.prisma.ivaWithholding.findMany({
      where: { companyId },
      include: { purchaseInvoice: { include: { supplier: true } } },
      orderBy: { withholdingDate: "desc" },
    });
  }

  async createIvaWithholding(companyId: string, dto: any) {
    const invoice = await this.prisma.purchaseInvoice.findUnique({
      where: { id: dto.purchaseInvoiceId },
      include: { supplier: true },
    });

    if (!invoice) throw new BadRequestException("Factura no encontrada");
    if (invoice.companyId !== companyId) throw new BadRequestException("Factura no pertenece a esta empresa");

    // Cálculo: (Monto IVA) * (Porcentaje de Retención / 100)
    const ivaAmount = Number(invoice.taxAmount);
    const pct = Number(dto.withholdingPct); // 75 or 100
    const withheldAmount = (ivaAmount * pct) / 100;

    // Crear retención y actualizar factura (transacción)
    return this.prisma.$transaction(async (tx) => {
      const withholding = await tx.ivaWithholding.create({
        data: {
          companyId,
          purchaseInvoiceId: invoice.id,
          voucherNumber: dto.voucherNumber, // AAAAMMDD + 8 dígitos
          withholdingDate: new Date(dto.withholdingDate),
          withholdingPct: pct,
          baseAmount: invoice.subtotal,
          ivaAmount: invoice.taxAmount,
          withheldAmount: withheldAmount,
        },
      });

      await tx.purchaseInvoice.update({
        where: { id: invoice.id },
        data: {
          ivaWithheldAmount: withheldAmount,
          ivaWithholdingNumber: dto.voucherNumber,
        },
      });

      return withholding;
    });
  }

  async exportarIvaTxt(companyId: string, year: number, month: number): Promise<string> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const withholdings = await this.prisma.ivaWithholding.findMany({
      where: { companyId, withholdingDate: { gte: startDate, lte: endDate } },
      include: { purchaseInvoice: { include: { supplier: true } } },
      orderBy: { withholdingDate: "asc" },
    });

    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    const rifEmpresa = company?.rif?.replace(/-/g, "") || "J123456789";
    const periodo = year + String(month).padStart(2, "0");

    let txtContent = "";
    for (const w of withholdings) {
      const inv = w.purchaseInvoice;
      const campos = [
        rifEmpresa, // 1. RIF agente retención
        periodo, // 2. Período
        w.withholdingDate.toISOString().split("T")[0].replace(/-/g, "-"), // 3. Fecha (Formato depende, asumo YYYY-MM-DD o DD/MM/YYYY. Providencia: AAAA-MM-DD)
        "C", // 4. Tipo Operacion (C=Compra)
        "01", // 5. Tipo Documento (01=Factura)
        inv.supplier.rif.replace(/-/g, ""), // 6. RIF del retenido
        inv.invoiceNumber, // 7. Número Factura
        inv.controlNumber, // 8. Número Control
        Number(inv.total).toFixed(2), // 9. Monto Total Documento
        Number(w.baseAmount).toFixed(2), // 10. Base Imponible
        Number(w.withheldAmount).toFixed(2), // 11. Monto Retenido
        0, // 12. Doc Afectado (si aplica nota crédito/débito)
        w.voucherNumber, // 13. Número de Comprobante
        Number(w.ivaAmount).toFixed(2), // 14. Monto Exento (según campo SENIAT a veces va exento, a veces IVA) - Esto varía, usaremos 0
        Number(inv.exemptAmount).toFixed(2), // 15. Compras Exentas
        16, // 16. Alicuota
      ];
      txtContent += campos.join("\t") + "\n";
    }

    return txtContent;
  }

  // ================= CONCEPTOS DE ISLR =================
  async getIslrConcepts(companyId: string) {
    return this.prisma.islrConcept.findMany({ where: { companyId }, orderBy: { code: 'asc' } });
  }

  async seedIslrConcepts(companyId: string) {
    // Seeders de prueba de conceptos comunes Decreto 1808
    const conceptos = [
      { code: "027", description: "Honorarios Profesionales Residentes", rateJuridica: 5.0, rateNatural: 3.0, sustraendoUt: 83.3334 },
      { code: "053", description: "Fletes y Transporte", rateJuridica: 3.0, rateNatural: 3.0, sustraendoUt: 0 },
      { code: "054", description: "Servicios Publicidad y Radio", rateJuridica: 5.0, rateNatural: 3.0, sustraendoUt: 0 },
    ];

    for (const c of conceptos) {
      await this.prisma.islrConcept.upsert({
        where: { companyId_code: { companyId, code: c.code } },
        update: {},
        create: { ...c, companyId },
      });
    }
    return this.getIslrConcepts(companyId);
  }

  // ================= RETENCIONES DE ISLR =================
  async getIslrWithholdings(companyId: string) {
    return this.prisma.islrWithholding.findMany({
      where: { companyId },
      include: { supplier: true, islrConcept: true },
      orderBy: { withholdingDate: "desc" },
    });
  }

  async createIslrWithholding(companyId: string, dto: any) {
    const concept = await this.prisma.islrConcept.findUnique({ where: { id: dto.islrConceptId } });
    if (!concept) throw new BadRequestException("Concepto ISLR no encontrado");

    const rate = dto.personType === "NATURAL" ? Number(concept.rateNatural) : Number(concept.rateJuridica);
    let withheldAmount = (Number(dto.paymentAmount) * rate) / 100;
    
    // Aplicar sustraendo si es natural
    const sustraendoBs = dto.personType === "NATURAL" ? Number(dto.sustraendoBs) : 0;
    withheldAmount = Math.max(0, withheldAmount - sustraendoBs);

    return this.prisma.islrWithholding.create({
      data: {
        companyId,
        supplierId: dto.supplierId,
        islrConceptId: concept.id,
        purchaseInvoiceId: dto.purchaseInvoiceId,
        voucherNumber: dto.voucherNumber,
        withholdingDate: new Date(dto.withholdingDate),
        personType: dto.personType,
        paymentAmount: Number(dto.paymentAmount),
        withholdingRate: rate,
        sustraendoBs: sustraendoBs,
        withheldAmount: withheldAmount,
      },
    });
  }
}
