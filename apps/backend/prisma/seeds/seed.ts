/**
 * SEEDER: Plan de Cuentas VEN-NIF estándar + Valores Fiscales Iniciales
 *
 * ⚠️ SUPUESTOS NORMATIVOS — Requieren validación del Contador Público antes de producción:
 *   - Alícuota General IVA: 16% (Art. 27 Ley IVA, G.O. 6.507)
 *   - Alícuota Reducida IVA: 8% (Art. 63 Ley IVA)
 *   - Alícuota Adicional (suntuario): 15% (total efectivo 31%, Art. 61 Ley IVA)
 *   - IGTF en divisas: 3% (Ley IGTF, G.O. 6.687, desde 28/03/2022)
 *   - IGTF en Bolívares: 0% (reducido por Decreto 4.972, G.O. 42.919 del 12/07/2024)
 *   - Unidad Tributaria: Bs. 9.00 (Prov. SNAT/2023/000031, ratificada 2024)
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeder de NovaERP...');

  // ── 1. Roles base ────────────────────────────────────────────────
  const roles = [
    { name: 'ADMIN', description: 'Administrador del sistema' },
    { name: 'CONTADOR', description: 'Contador público - gestión contable y fiscal' },
    { name: 'CAJERO', description: 'Cajero - emisión de facturas y cobranza' },
    { name: 'AUDITOR', description: 'Auditor - consulta de logs y reportes' },
    { name: 'RRHH', description: 'Recursos Humanos - gestión de nómina' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log('✅ Roles creados');

  // ── 2. Empresa y usuario administrador de demo ───────────────────
  let company = await prisma.company.findFirst({ where: { rif: 'J-00000001-0' } });
  if (!company) {
    company = await prisma.company.create({
      data: {
        legalName: 'Empresa Demo C.A.',
        rif: 'J-00000001-0',
        fiscalAddress: 'Av. Principal, Caracas, Venezuela',
      },
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const passwordHash = await bcrypt.hash('Admin@NovaERP2026', 12);

  let adminUser = await prisma.user.findFirst({ where: { email: 'admin@novaerp.ve' } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@novaerp.ve',
        passwordHash,
        fullName: 'Administrador NovaERP',
      },
    });
  }

  await prisma.userCompanyRole.upsert({
    where: { userId_companyId: { userId: adminUser.id, companyId: company.id } },
    update: {},
    create: { userId: adminUser.id, companyId: company.id, roleId: adminRole!.id },
  });
  console.log('✅ Empresa y usuario administrador de demo creados');

  // ── 3. Valores Fiscales Iniciales ────────────────────────────────
  const taxRates = [
    { taxType: 'IVA_GENERAL', rate: 16.0000, validFrom: new Date('2020-01-29'), description: 'IVA Alícuota General 16% (Art. 27, G.O. 6.507)' },
    { taxType: 'IVA_REDUCIDO', rate: 8.0000, validFrom: new Date('2020-01-29'), description: 'IVA Alícuota Reducida 8% (Art. 63, G.O. 6.507)' },
    { taxType: 'IVA_ADICIONAL', rate: 15.0000, validFrom: new Date('2020-01-29'), description: 'IVA Alícuota Adicional 15% suntuario (total 31%, Art. 61)' },
    { taxType: 'IGTF_DIVISAS', rate: 3.0000, validFrom: new Date('2022-03-28'), description: 'IGTF 3% sobre pagos en divisas/criptoactivos no soberanos (G.O. 6.687)' },
    { taxType: 'IGTF_BOLIVARES', rate: 0.0000, validFrom: new Date('2024-07-12'), description: 'IGTF Bs. reducido al 0% (Decreto 4.972, G.O. 42.919)' },
    { taxType: 'RETENCION_IVA_GENERAL', rate: 75.0000, validFrom: new Date('2015-07-14'), description: 'Retención IVA 75% - Contribuyentes Especiales (Prov. SNAT/2015/0049)' },
    { taxType: 'RETENCION_IVA_TOTAL', rate: 100.0000, validFrom: new Date('2015-07-14'), description: 'Retención IVA 100% - Casos especiales (Art. 5 Prov. SNAT/2015/0049)' },
    { taxType: 'ISLR_SERVICIOS_JURIDICA', rate: 2.0000, validFrom: new Date('1997-05-22'), description: 'Retención ISLR 2% - Servicios/Obras - Persona Jurídica (Decreto 1.808)' },
    { taxType: 'ISLR_HONORARIOS_JURIDICA', rate: 5.0000, validFrom: new Date('1997-05-22'), description: 'Retención ISLR 5% - Honorarios - Persona Jurídica (Decreto 1.808)' },
    { taxType: 'ISLR_ARRENDAMIENTO_JURIDICA', rate: 5.0000, validFrom: new Date('1997-05-22'), description: 'Retención ISLR 5% - Arrendamiento - Persona Jurídica (Decreto 1.808)' },
  ];

  for (const tr of taxRates) {
    const existing = await prisma.taxRate.findFirst({
      where: { taxType: tr.taxType, validFrom: tr.validFrom },
    });
    if (!existing) {
      await prisma.taxRate.create({ data: tr });
    }
  }
  console.log('✅ Tasas fiscales iniciales creadas');

  // ── 4. Unidad Tributaria inicial ─────────────────────────────────
  const existingUT = await prisma.taxUnitHistory.findFirst({
    where: { validFrom: new Date('2023-05-01') },
  });
  if (!existingUT) {
    await prisma.taxUnitHistory.create({
      data: {
        value: 9.0000,
        validFrom: new Date('2023-05-01'),
        resolution: 'Providencia SNAT/2023/000031 (G.O. 42.623 mayo 2023), ratificada SNAT/2024/000042',
      },
    });
  }
  console.log('✅ Unidad Tributaria (UT = Bs. 9,00) creada');

  // ── 5. Plan de Cuentas VEN-NIF (Estándar) ────────────────────────
  const chartOfAccounts = [
    // ACTIVOS
    { code: '1', name: 'ACTIVO', type: 'ASSET', isControl: true },
    { code: '1.1', name: 'ACTIVO CIRCULANTE', type: 'ASSET', isControl: true, parentCode: '1' },
    { code: '1.1.01', name: 'Efectivo y Equivalentes de Efectivo', type: 'ASSET', isControl: true, parentCode: '1.1' },
    { code: '1.1.01.01', name: 'Caja Principal', type: 'ASSET', parentCode: '1.1.01' },
    { code: '1.1.01.02', name: 'Caja Chica', type: 'ASSET', parentCode: '1.1.01' },
    { code: '1.1.01.03', name: 'Bancos - Cuentas Corrientes', type: 'ASSET', parentCode: '1.1.01' },
    { code: '1.1.02', name: 'Cuentas por Cobrar', type: 'ASSET', isControl: true, parentCode: '1.1' },
    { code: '1.1.02.01', name: 'Clientes', type: 'ASSET', parentCode: '1.1.02' },
    { code: '1.1.02.02', name: 'Efectos por Cobrar', type: 'ASSET', parentCode: '1.1.02' },
    { code: '1.1.02.03', name: 'Anticipos a Proveedores', type: 'ASSET', parentCode: '1.1.02' },
    { code: '1.1.03', name: 'Inventarios', type: 'ASSET', isControl: true, parentCode: '1.1' },
    { code: '1.1.03.01', name: 'Inventario de Mercancías', type: 'ASSET', parentCode: '1.1.03' },
    { code: '1.1.04', name: 'Créditos Fiscales IVA', type: 'ASSET', isControl: true, parentCode: '1.1' },
    { code: '1.1.04.01', name: 'Crédito Fiscal IVA - Compras', type: 'ASSET', parentCode: '1.1.04' },
    { code: '1.1.04.02', name: 'Retenciones IVA por Compensar', type: 'ASSET', parentCode: '1.1.04' },
    { code: '1.2', name: 'ACTIVO NO CIRCULANTE', type: 'ASSET', isControl: true, parentCode: '1' },
    { code: '1.2.01', name: 'Activos Fijos', type: 'ASSET', isControl: true, parentCode: '1.2' },
    { code: '1.2.01.01', name: 'Terrenos', type: 'ASSET', parentCode: '1.2.01' },
    { code: '1.2.01.02', name: 'Edificios', type: 'ASSET', parentCode: '1.2.01' },
    { code: '1.2.01.03', name: 'Maquinaria y Equipos', type: 'ASSET', parentCode: '1.2.01' },
    { code: '1.2.01.04', name: 'Vehículos', type: 'ASSET', parentCode: '1.2.01' },
    { code: '1.2.01.05', name: 'Depreciación Acumulada', type: 'ASSET', parentCode: '1.2.01' },

    // PASIVOS
    { code: '2', name: 'PASIVO', type: 'LIABILITY', isControl: true },
    { code: '2.1', name: 'PASIVO CIRCULANTE', type: 'LIABILITY', isControl: true, parentCode: '2' },
    { code: '2.1.01', name: 'Cuentas por Pagar', type: 'LIABILITY', isControl: true, parentCode: '2.1' },
    { code: '2.1.01.01', name: 'Proveedores', type: 'LIABILITY', parentCode: '2.1.01' },
    { code: '2.1.01.02', name: 'Efectos por Pagar', type: 'LIABILITY', parentCode: '2.1.01' },
    { code: '2.1.02', name: 'Obligaciones Fiscales', type: 'LIABILITY', isControl: true, parentCode: '2.1' },
    { code: '2.1.02.01', name: 'IVA por Pagar (Débito Fiscal)', type: 'LIABILITY', parentCode: '2.1.02' },
    { code: '2.1.02.02', name: 'Retenciones IVA por Pagar', type: 'LIABILITY', parentCode: '2.1.02' },
    { code: '2.1.02.03', name: 'Retenciones ISLR por Pagar', type: 'LIABILITY', parentCode: '2.1.02' },
    { code: '2.1.02.04', name: 'IGTF por Pagar', type: 'LIABILITY', parentCode: '2.1.02' },
    { code: '2.1.03', name: 'Obligaciones Laborales', type: 'LIABILITY', isControl: true, parentCode: '2.1' },
    { code: '2.1.03.01', name: 'Nóminas por Pagar', type: 'LIABILITY', parentCode: '2.1.03' },
    { code: '2.1.03.02', name: 'IVSS por Pagar', type: 'LIABILITY', parentCode: '2.1.03' },
    { code: '2.1.03.03', name: 'FAOV por Pagar', type: 'LIABILITY', parentCode: '2.1.03' },
    { code: '2.1.03.04', name: 'INCES por Pagar', type: 'LIABILITY', parentCode: '2.1.03' },
    { code: '2.1.03.05', name: 'Prestaciones Sociales por Pagar', type: 'LIABILITY', parentCode: '2.1.03' },

    // PATRIMONIO
    { code: '3', name: 'PATRIMONIO', type: 'EQUITY', isControl: true },
    { code: '3.1', name: 'Capital Social', type: 'EQUITY', isControl: true, parentCode: '3' },
    { code: '3.1.01', name: 'Capital Pagado', type: 'EQUITY', parentCode: '3.1' },
    { code: '3.2', name: 'Utilidades', type: 'EQUITY', isControl: true, parentCode: '3' },
    { code: '3.2.01', name: 'Utilidades Retenidas', type: 'EQUITY', parentCode: '3.2' },
    { code: '3.2.02', name: 'Utilidad/Pérdida del Ejercicio', type: 'EQUITY', parentCode: '3.2' },

    // INGRESOS
    { code: '4', name: 'INGRESOS', type: 'REVENUE', isControl: true },
    { code: '4.1', name: 'Ingresos por Ventas', type: 'REVENUE', isControl: true, parentCode: '4' },
    { code: '4.1.01', name: 'Ventas de Mercancías', type: 'REVENUE', parentCode: '4.1' },
    { code: '4.1.02', name: 'Ingresos por Servicios', type: 'REVENUE', parentCode: '4.1' },
    { code: '4.1.03', name: 'Devoluciones y Descuentos sobre Ventas', type: 'REVENUE', parentCode: '4.1' },
    { code: '4.2', name: 'Otros Ingresos', type: 'REVENUE', isControl: true, parentCode: '4' },
    { code: '4.2.01', name: 'Ganancias Cambiarias', type: 'REVENUE', parentCode: '4.2' },
    { code: '4.2.02', name: 'Ingresos Financieros', type: 'REVENUE', parentCode: '4.2' },

    // COSTOS Y GASTOS
    { code: '5', name: 'COSTOS Y GASTOS', type: 'EXPENSE', isControl: true },
    { code: '5.1', name: 'Costo de Ventas', type: 'EXPENSE', isControl: true, parentCode: '5' },
    { code: '5.1.01', name: 'Costo de Mercancías Vendidas', type: 'EXPENSE', parentCode: '5.1' },
    { code: '5.2', name: 'Gastos Operativos', type: 'EXPENSE', isControl: true, parentCode: '5' },
    { code: '5.2.01', name: 'Gastos de Personal', type: 'EXPENSE', isControl: true, parentCode: '5.2' },
    { code: '5.2.01.01', name: 'Sueldos y Salarios', type: 'EXPENSE', parentCode: '5.2.01' },
    { code: '5.2.01.02', name: 'Utilidades', type: 'EXPENSE', parentCode: '5.2.01' },
    { code: '5.2.01.03', name: 'Vacaciones', type: 'EXPENSE', parentCode: '5.2.01' },
    { code: '5.2.01.04', name: 'Prestaciones Sociales', type: 'EXPENSE', parentCode: '5.2.01' },
    { code: '5.2.01.05', name: 'Aportes Patronales IVSS', type: 'EXPENSE', parentCode: '5.2.01' },
    { code: '5.2.01.06', name: 'Aportes Patronales FAOV', type: 'EXPENSE', parentCode: '5.2.01' },
    { code: '5.2.01.07', name: 'Aportes Patronales INCES', type: 'EXPENSE', parentCode: '5.2.01' },
    { code: '5.2.02', name: 'Gastos Administrativos', type: 'EXPENSE', isControl: true, parentCode: '5.2' },
    { code: '5.2.02.01', name: 'Alquileres', type: 'EXPENSE', parentCode: '5.2.02' },
    { code: '5.2.02.02', name: 'Servicios Públicos', type: 'EXPENSE', parentCode: '5.2.02' },
    { code: '5.2.02.03', name: 'Gastos de Papelería y Útiles', type: 'EXPENSE', parentCode: '5.2.02' },
    { code: '5.2.02.04', name: 'Honorarios Profesionales', type: 'EXPENSE', parentCode: '5.2.02' },
    { code: '5.2.02.05', name: 'Depreciación del Ejercicio', type: 'EXPENSE', parentCode: '5.2.02' },
    { code: '5.3', name: 'Gastos Financieros', type: 'EXPENSE', isControl: true, parentCode: '5' },
    { code: '5.3.01', name: 'Pérdidas Cambiarias', type: 'EXPENSE', parentCode: '5.3' },
    { code: '5.3.02', name: 'Intereses y Comisiones Bancarias', type: 'EXPENSE', parentCode: '5.3' },
  ];

  // Crear en dos pasadas: primero cuentas padre (sin parentCode), luego hijas
  const codeToId: Record<string, string> = {};

  const rootAccounts = chartOfAccounts.filter((a) => !a.parentCode);
  for (const acc of rootAccounts) {
    const existing = await prisma.chartOfAccount.findFirst({
      where: { companyId: company.id, code: acc.code },
    });
    if (!existing) {
      const created = await prisma.chartOfAccount.create({
        data: {
          companyId: company.id,
          code: acc.code,
          name: acc.name,
          type: acc.type,
          isControl: acc.isControl ?? false,
        },
      });
      codeToId[acc.code] = created.id;
    } else {
      codeToId[acc.code] = existing.id;
    }
  }

  // Pasadas sucesivas para cuentas hijas (máximo 5 niveles)
  for (let pass = 0; pass < 5; pass++) {
    const children = chartOfAccounts.filter(
      (a) => a.parentCode && codeToId[a.parentCode] && !codeToId[a.code],
    );
    for (const acc of children) {
      const existing = await prisma.chartOfAccount.findFirst({
        where: { companyId: company.id, code: acc.code },
      });
      if (!existing) {
        const created = await prisma.chartOfAccount.create({
          data: {
            companyId: company.id,
            code: acc.code,
            name: acc.name,
            type: acc.type,
            isControl: acc.isControl ?? false,
            parentId: codeToId[acc.parentCode!],
          },
        });
        codeToId[acc.code] = created.id;
      } else {
        codeToId[acc.code] = existing.id;
      }
    }
  }

  console.log(`✅ Plan de cuentas VEN-NIF creado: ${Object.keys(codeToId).length} cuentas`);
  console.log('🎉 Seeder completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
