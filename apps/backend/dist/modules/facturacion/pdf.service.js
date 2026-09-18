"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
const pdfkit_1 = __importDefault(require("pdfkit"));
const QRCode = __importStar(require("qrcode"));
let PdfService = class PdfService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateInvoicePdf(invoiceId, companyId, stream) {
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
        const doc = new pdfkit_1.default({ margin: 50, size: "LETTER" });
        doc.pipe(stream);
        doc.fontSize(20).text(invoice.company.legalName, { align: "center" });
        doc.fontSize(10).text(`RIF: ${invoice.company.rif}`, { align: "center" });
        doc.moveDown();
        doc.fontSize(14).text("FACTURA", { align: "right" });
        doc.fontSize(10).text(`N°: ${String(invoice.number).padStart(6, "0")}`, { align: "right" });
        doc.text(`N° Control: ${invoice.controlNumber || String(invoice.number).padStart(6, "0")}`, { align: "right" });
        doc.text(`Fecha: ${invoice.invoiceDate.toLocaleDateString()}`, { align: "right" });
        doc.moveDown();
        doc.fontSize(12).text("Datos del Cliente:");
        doc.fontSize(10).text(`Razón Social: ${invoice.customer.legalName}`);
        doc.text(`RIF: ${invoice.customer.rif}`);
        doc.text(`Dirección: ${invoice.customer.address || "N/A"}`);
        doc.moveDown();
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
        const qrData = `https://seniat.gob.ve/validador?rif=${invoice.company.rif}&fact=${invoice.number}&fecha=${invoice.invoiceDate.toISOString().split('T')[0]}&total=${invoice.total}`;
        try {
            const qrImage = await QRCode.toDataURL(qrData, { margin: 1 });
            doc.image(qrImage, 50, y, { width: 100 });
            doc.fontSize(8).text("Firma Electrónica / Providencia 0102", 160, y + 50);
        }
        catch (e) {
            console.error("Error generando QR", e);
        }
        doc.end();
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PdfService);
//# sourceMappingURL=pdf.service.js.map