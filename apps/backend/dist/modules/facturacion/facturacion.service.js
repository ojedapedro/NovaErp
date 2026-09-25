"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacturacionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
const journal_automation_service_1 = require("../../core/accounting/journal-automation.service");
let FacturacionService = class FacturacionService {
    prisma;
    journalAutomation;
    constructor(prisma, journalAutomation) {
        this.prisma = prisma;
        this.journalAutomation = journalAutomation;
    }
    async findAllCustomers(companyId) {
        return this.prisma.customer.findMany({
            where: { companyId, isActive: true },
            orderBy: { legalName: 'asc' },
        });
    }
    async createCustomer(companyId, dto) {
        const existing = await this.prisma.customer.findUnique({ where: { companyId_rif: { companyId, rif: dto.rif } } });
        if (existing)
            throw new common_1.BadRequestException('Ya existe un cliente con RIF ' + dto.rif);
        return this.prisma.customer.create({ data: { ...dto, companyId } });
    }
    async updateCustomer(companyId, id, dto) {
        const customer = await this.prisma.customer.findFirst({ where: { id, companyId } });
        if (!customer)
            throw new common_1.NotFoundException('Cliente no encontrado');
        return this.prisma.customer.update({ where: { id }, data: dto });
    }
    async findAllProducts(companyId) {
        return this.prisma.product.findMany({ where: { companyId, isActive: true }, orderBy: { name: 'asc' } });
    }
    async createProduct(companyId, dto) {
        const existing = await this.prisma.product.findUnique({ where: { companyId_code: { companyId, code: dto.code } } });
        if (existing)
            throw new common_1.BadRequestException('Ya existe un producto con codigo ' + dto.code);
        return this.prisma.product.create({ data: { ...dto, companyId } });
    }
    async updateProduct(companyId, id, dto) {
        const product = await this.prisma.product.findFirst({ where: { id, companyId } });
        if (!product)
            throw new common_1.NotFoundException('Producto no encontrado');
        return this.prisma.product.update({ where: { id }, data: dto });
    }
    async findAllInvoices(companyId, params) {
        return this.prisma.invoice.findMany({
            where: { companyId, ...(params?.status && { status: params.status }), ...(params?.customerId && { customerId: params.customerId }) },
            include: { customer: { select: { legalName: true, rif: true } }, items: { include: { product: { select: { name: true, code: true } } } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createInvoice(companyId, dto) {
        const [ivaRate, igtfRate] = await Promise.all([
            this.prisma.taxRate.findFirst({ where: { taxType: 'IVA_GENERAL' }, orderBy: { validFrom: 'desc' } }),
            this.prisma.taxRate.findFirst({ where: { taxType: 'IGTF_DIVISAS' }, orderBy: { validFrom: 'desc' } }),
        ]);
        const ivaPct = Number(ivaRate?.rate ?? 16);
        const igtfPct = dto.applyIgtf ? Number(igtfRate?.rate ?? 3) : 0;
        let subtotal = 0;
        let taxAmount = 0;
        const itemsData = [];
        for (const item of dto.items) {
            const product = await this.prisma.product.findFirst({ where: { id: item.productId, companyId } });
            if (!product)
                throw new common_1.NotFoundException('Producto ' + item.productId + ' no encontrado');
            const availableStock = Number(product.stock);
            const qty = Number(item.quantity);
            if (qty > availableStock) {
                throw new common_1.BadRequestException('Stock insuficiente para ' + product.name + ': disponible ' + availableStock + ', solicitado ' + qty);
            }
            const lineSub = qty * Number(item.unitPrice);
            const lineTax = lineSub * (ivaPct / 100);
            subtotal += lineSub;
            taxAmount += lineTax;
            itemsData.push({ productId: item.productId, description: item.description || product.name, quantity: qty, unitPrice: Number(item.unitPrice), taxRate: ivaPct, subtotal: lineSub, taxAmount: lineTax, total: lineSub + lineTax, _cost: Number(product.unitPrice) });
        }
        const igtfAmount = (subtotal + taxAmount) * (igtfPct / 100);
        const total = subtotal + taxAmount + igtfAmount;
        return this.prisma.$transaction(async (tx) => {
            const lastInv = await tx.invoice.findFirst({ where: { companyId }, orderBy: { number: 'desc' }, select: { number: true } });
            const nextNum = lastInv ? Number(lastInv.number) + 1 : 1;
            const cleanItems = itemsData.map(({ _cost, ...rest }) => rest);
            const invoice = await tx.invoice.create({
                data: { companyId, customerId: dto.customerId, number: nextNum, invoiceDate: new Date(dto.invoiceDate), status: 'ISSUED', subtotal, taxAmount, igtfAmount, total, currency: dto.currency || 'USD', exchangeRate: dto.exchangeRate || 1, notes: dto.notes ?? null, items: { create: cleanItems } },
                include: { customer: true, items: { include: { product: { select: { name: true, code: true } } } } },
            });
            for (const item of itemsData) {
                await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
                await tx.inventoryMovement.create({ data: { companyId, productId: item.productId, movementType: 'OUT', concept: 'VENTA', quantity: item.quantity, unitCost: item._cost, totalCost: item.quantity * item._cost, referenceId: invoice.id, referenceNumber: String(invoice.number), notes: 'Venta factura ' + String(invoice.number) } });
            }
            await this.journalAutomation.postInvoiceEntry(tx, companyId, {
                invoiceNumber: String(invoice.number),
                total: invoice.total,
                subtotal: invoice.subtotal,
                taxAmount: invoice.taxAmount,
                issueDate: invoice.invoiceDate
            }, itemsData);
            return invoice;
        });
    }
    async voidInvoice(companyId, id) {
        const invoice = await this.prisma.invoice.findFirst({ where: { id, companyId }, include: { items: true } });
        if (!invoice)
            throw new common_1.NotFoundException('Factura no encontrada');
        if (invoice.status === 'VOID')
            throw new common_1.BadRequestException('La factura ya fue anulada');
        return this.prisma.$transaction(async (tx) => {
            await tx.invoice.update({ where: { id, companyId }, data: { status: 'VOID' } });
            for (const item of invoice.items) {
                if (!item.productId)
                    continue;
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                const cost = product ? Number(product.unitPrice) : 0;
                await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
                await tx.inventoryMovement.create({ data: { companyId, productId: item.productId, movementType: 'IN', concept: 'ANULACION_VENTA', quantity: item.quantity, unitCost: cost, totalCost: Number(item.quantity) * cost, referenceId: invoice.id, referenceNumber: String(invoice.number), notes: 'Anulacion venta factura ' + String(invoice.number) } });
            }
            await this.journalAutomation.postInvoiceEntry(tx, companyId, {
                invoiceNumber: `${invoice.number} (ANULADA)`,
                total: -Number(invoice.total),
                subtotal: -Number(invoice.subtotal),
                taxAmount: -Number(invoice.taxAmount),
                issueDate: new Date()
            }, invoice.items);
            return { message: 'Factura ' + String(invoice.number) + ' anulada. Stock revertido.' };
        });
    }
};
exports.FacturacionService = FacturacionService;
exports.FacturacionService = FacturacionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        journal_automation_service_1.JournalAutomationService])
], FacturacionService);
//# sourceMappingURL=facturacion.service.js.map