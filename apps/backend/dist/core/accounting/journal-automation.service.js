"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var JournalAutomationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalAutomationService = void 0;
const common_1 = require("@nestjs/common");
let JournalAutomationService = JournalAutomationService_1 = class JournalAutomationService {
    logger = new common_1.Logger(JournalAutomationService_1.name);
    async postInvoiceEntry(tx, companyId, invoice, items) {
        const accounts = await this.findAccounts(tx, companyId, {
            cxc: { code: '1105', name: 'cobrar' },
            ventas: { code: '4101', name: 'ventas' },
            ivaDebito: { code: '2101', name: 'iva%deb' }
        });
        if (!accounts.cxc || !accounts.ventas) {
            this.logger.warn(`Could not create journal entry for invoice ${invoice.invoiceNumber}. Missing accounts.`);
            return;
        }
        const nextVoucher = await this.getNextVoucherNumber(tx, companyId);
        const journalEntries = [
            { accountId: accounts.cxc.id, debit: Number(invoice.total), credit: 0 },
            { accountId: accounts.ventas.id, debit: 0, credit: Number(invoice.subtotal) }
        ];
        if (Number(invoice.taxAmount) > 0 && accounts.ivaDebito) {
            journalEntries.push({
                accountId: accounts.ivaDebito.id,
                debit: 0,
                credit: Number(invoice.taxAmount)
            });
        }
        await tx.journalEntry.create({
            data: {
                companyId,
                entryDate: invoice.issueDate || new Date(),
                number: nextVoucher,
                concept: `Factura de Venta N° ${invoice.invoiceNumber}`,
                isPosted: true,
                lines: { create: journalEntries }
            }
        });
    }
    async postPurchaseEntry(tx, companyId, invoice, items) {
        const accounts = await this.findAccounts(tx, companyId, {
            inventario: { code: '1103', name: 'inventario' },
            ivaCredito: { code: '1106', name: 'iva%cred' },
            cxp: { code: '2101', name: 'pagar' }
        });
        if (!accounts.inventario || !accounts.cxp) {
            this.logger.warn(`Could not create journal entry for purchase invoice ${invoice.invoiceNumber}. Missing accounts.`);
            return;
        }
        const nextVoucher = await this.getNextVoucherNumber(tx, companyId);
        const journalEntries = [
            { accountId: accounts.inventario.id, debit: Number(invoice.subtotal), credit: 0 },
            { accountId: accounts.cxp.id, debit: 0, credit: Number(invoice.total) }
        ];
        if (Number(invoice.taxAmount) > 0 && accounts.ivaCredito) {
            journalEntries.push({ accountId: accounts.ivaCredito.id, debit: Number(invoice.taxAmount), credit: 0 });
        }
        await tx.journalEntry.create({
            data: {
                companyId,
                entryDate: invoice.issueDate || new Date(),
                number: nextVoucher,
                concept: `Factura de Compra N° ${invoice.invoiceNumber}`,
                isPosted: true,
                lines: { create: journalEntries }
            }
        });
    }
    async postReceiptEntry(tx, companyId, payment) {
        const accounts = await this.findAccounts(tx, companyId, {
            banco: { code: '1101', name: 'banco' },
            cxc: { code: '1105', name: 'cobrar' }
        });
        if (!accounts.banco || !accounts.cxc) {
            this.logger.warn(`Could not create journal entry for receipt ${payment.referenceNumber}. Missing accounts.`);
            return;
        }
        const nextVoucher = await this.getNextVoucherNumber(tx, companyId);
        await tx.journalEntry.create({
            data: {
                companyId,
                entryDate: payment.paymentDate || new Date(),
                number: nextVoucher,
                concept: `Cobro de Cliente Ref. ${payment.referenceNumber}`,
                isPosted: true,
                lines: {
                    create: [
                        { accountId: accounts.banco.id, debit: Number(payment.amount), credit: 0 },
                        { accountId: accounts.cxc.id, debit: 0, credit: Number(payment.amount) }
                    ]
                }
            }
        });
    }
    async postSupplierPaymentEntry(tx, companyId, payment) {
        const accounts = await this.findAccounts(tx, companyId, {
            cxp: { code: '2101', name: 'pagar' },
            banco: { code: '1101', name: 'banco' }
        });
        if (!accounts.cxp || !accounts.banco) {
            this.logger.warn(`Could not create journal entry for supplier payment ${payment.referenceNumber}. Missing accounts.`);
            return;
        }
        const nextVoucher = await this.getNextVoucherNumber(tx, companyId);
        await tx.journalEntry.create({
            data: {
                companyId,
                entryDate: payment.paymentDate || new Date(),
                number: nextVoucher,
                concept: `Pago a Proveedor Ref. ${payment.referenceNumber}`,
                isPosted: true,
                lines: {
                    create: [
                        { accountId: accounts.cxp.id, debit: Number(payment.amount), credit: 0 },
                        { accountId: accounts.banco.id, debit: 0, credit: Number(payment.amount) }
                    ]
                }
            }
        });
    }
    async postIvaWithholdingEntry(tx, companyId, withholding, invoice) {
        const accounts = await this.findAccounts(tx, companyId, {
            cxp: { code: '2101', name: 'pagar' },
            retencionesIva: { code: '2103', name: 'retenc%iva%' }
        });
        if (!accounts.cxp || !accounts.retencionesIva) {
            this.logger.warn(`Could not create journal entry for IVA withholding ${withholding.voucherNumber}. Missing accounts.`);
            return;
        }
        const nextVoucher = await this.getNextVoucherNumber(tx, companyId);
        await tx.journalEntry.create({
            data: {
                companyId,
                entryDate: withholding.issueDate || new Date(),
                number: nextVoucher,
                concept: `Retención de IVA N° ${withholding.voucherNumber}`,
                isPosted: true,
                lines: {
                    create: [
                        { accountId: accounts.cxp.id, debit: Number(withholding.withheldAmount), credit: 0 },
                        { accountId: accounts.retencionesIva.id, debit: 0, credit: Number(withholding.withheldAmount) }
                    ]
                }
            }
        });
    }
    async postPayrollEntry(tx, companyId, period, items) {
        const accounts = await this.findAccounts(tx, companyId, {
            gastoSueldos: { code: '6101', name: 'sueldos' },
            obligacionesLaborales: { code: '2201', name: 'laborales' }
        });
        if (!accounts.gastoSueldos || !accounts.obligacionesLaborales) {
            this.logger.warn(`Could not create journal entry for payroll period ${period.periodName}. Missing accounts.`);
            return;
        }
        const nextVoucher = await this.getNextVoucherNumber(tx, companyId);
        const totalAmount = items.reduce((sum, item) => sum + Number(item.netPay || item.amount || item.baseSalary || 0), 0);
        await tx.journalEntry.create({
            data: {
                companyId,
                entryDate: new Date(),
                number: nextVoucher,
                concept: `Nómina ${period.periodName}`,
                isPosted: true,
                lines: {
                    create: [
                        { accountId: accounts.gastoSueldos.id, debit: totalAmount, credit: 0 },
                        { accountId: accounts.obligacionesLaborales.id, debit: 0, credit: totalAmount }
                    ]
                }
            }
        });
    }
    async getNextVoucherNumber(tx, companyId) {
        const lastEntry = await tx.journalEntry.findFirst({
            where: { companyId },
            orderBy: { number: 'desc' },
        });
        if (!lastEntry) {
            return BigInt(1);
        }
        return BigInt(lastEntry.number) + BigInt(1);
    }
    async findAccounts(tx, companyId, accountMap) {
        const result = {};
        for (const [key, search] of Object.entries(accountMap)) {
            let account = await tx.chartOfAccount.findFirst({
                where: {
                    companyId,
                    code: { startsWith: search.code }
                }
            });
            if (!account) {
                account = await tx.chartOfAccount.findFirst({
                    where: {
                        companyId,
                        name: { contains: search.name.replace(/%/g, ''), mode: 'insensitive' }
                    }
                });
            }
            result[key] = account;
        }
        return result;
    }
};
exports.JournalAutomationService = JournalAutomationService;
exports.JournalAutomationService = JournalAutomationService = JournalAutomationService_1 = __decorate([
    (0, common_1.Injectable)()
], JournalAutomationService);
//# sourceMappingURL=journal-automation.service.js.map