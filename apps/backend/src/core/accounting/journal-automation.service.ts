import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class JournalAutomationService {
  private readonly logger = new Logger(JournalAutomationService.name);

  async postInvoiceEntry(tx: Prisma.TransactionClient, companyId: string, invoice: any, items: any[]) {
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

  async postPurchaseEntry(tx: Prisma.TransactionClient, companyId: string, invoice: any, items: any[]) {
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

  async postReceiptEntry(tx: Prisma.TransactionClient, companyId: string, payment: any) {
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

  async postSupplierPaymentEntry(tx: Prisma.TransactionClient, companyId: string, payment: any) {
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

  async postIvaWithholdingEntry(tx: Prisma.TransactionClient, companyId: string, withholding: any, invoice: any) {
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

  async postPayrollEntry(tx: Prisma.TransactionClient, companyId: string, period: any, items: any[]) {
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

  private async getNextVoucherNumber(tx: Prisma.TransactionClient, companyId: string): Promise<bigint> {
    const lastEntry = await tx.journalEntry.findFirst({
      where: { companyId },
      orderBy: { number: 'desc' },
    });

    if (!lastEntry) {
      return BigInt(1);
    }

    return BigInt(lastEntry.number) + BigInt(1);
  }

  private async findAccounts(tx: Prisma.TransactionClient, companyId: string, accountMap: Record<string, { code: string, name: string }>) {
    const result: Record<string, any> = {};
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
}
