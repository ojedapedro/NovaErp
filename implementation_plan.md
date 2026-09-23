# Implementación del Módulo de Inventario

Este documento detalla el plan técnico para desarrollar el módulo de Inventario Robusto (Kardex) para NovaERP, abarcando auditoría, toma física e inventario valorizado.

## Descripción del Problema
Actualmente, el sistema gestiona el stock sumando o restando directamente al campo `stock` de `Product`. Esto no permite auditar *por qué* cambió el stock, ni generar un Kardex, ni valorar el inventario históricamente. El usuario ha solicitado un módulo completo que rastree entradas (compras), salidas (ventas) y ajustes (toma física), así como reportes de auditoría y valorización.

## Cambios Propuestos

### 1. Base de Datos (Prisma Schema)
Se agregará un nuevo modelo `InventoryMovement` para registrar todo el historial (Kardex).

#### [MODIFY] `apps/backend/prisma/schema.prisma`
Se añadirá la siguiente tabla:
```prisma
model InventoryMovement {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId       String   @map("company_id") @db.Uuid
  productId       String   @map("product_id") @db.Uuid
  movementType    String   @map("movement_type") @db.VarChar(20) // IN, OUT, ADJUSTMENT
  concept         String   @db.VarChar(100) // "COMPRA", "VENTA", "TOMA_FISICA"
  quantity        Decimal  @db.Decimal(18, 4)
  unitCost        Decimal  @map("unit_cost") @db.Decimal(18, 2)
  totalCost       Decimal  @map("total_cost") @db.Decimal(18, 2)
  referenceId     String?  @map("reference_id") @db.Uuid // ID de Factura o Compra
  referenceNumber String?  @map("reference_number") @db.VarChar(50) // Número de factura/control
  notes           String?  @db.Text
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@index([companyId, productId, createdAt])
  @@map("inventory_movements")
}
```
*Se relacionará con `Company` y `Product`.*

### 2. Backend (NestJS)

#### [NEW] Módulo `inventario` (`apps/backend/src/modules/inventario/*`)
- `inventario.module.ts`: Definición del módulo.
- `inventario.controller.ts`: Rutas para obtener el Kardex (`/kardex/:productId`), obtener valorización (`/valorizado`), y registrar tomas físicas (`/ajustes`).
- `inventario.service.ts`: Lógica principal para consultar movimientos e insertar ajustes.

#### [MODIFY] `apps/backend/src/modules/compras/compras.service.ts`
- Modificar la creación de facturas de compra para que, además de sumar el `stock`, inserte un `InventoryMovement` de tipo `IN` con el concepto `COMPRA` y guarde el costo unitario real.

#### [MODIFY] `apps/backend/src/modules/facturacion/facturacion.service.ts`
- Modificar la creación de facturas de venta para que reste el `stock` e inserte un `InventoryMovement` de tipo `OUT` con el concepto `VENTA`.

### 3. Frontend (React + Ant Design)

#### [NEW] Carpeta y Vistas de Inventario (`apps/frontend/src/pages/inventario/*`)
- **`DashboardInventario.tsx`**: KPI de valor total del inventario, y últimos movimientos.
- **`Kardex.tsx`** (Auditoría de Inventario): Tabla que muestra el historial de entradas y salidas por producto.
- **`Ajustes.tsx`** (Toma Física): Formulario para corregir inventario tras un conteo físico, especificando mermas o sobrantes.
- **`Valorizado.tsx`**: Reporte en tabla de (Stock x Costo Promedio/Último Costo) de todos los productos.

#### [MODIFY] `apps/frontend/src/router/index.tsx` & Sidebar
- Integrar las nuevas rutas al menú principal bajo la sección "Inventario".

#### [MODIFY] `apps/frontend/src/api/inventario.ts`
- Crear el cliente Axios para comunicarse con los nuevos endpoints.

## Plan de Verificación
1. **Automático**: La migración Prisma pasará si el esquema está correcto. El compilador TypeScript verificará los DTOs.
2. **Manual**:
   - Crear una compra y verificar que el stock suba y se registre el Kardex.
   - Crear una venta y verificar que el stock baje y se registre el Kardex.
   - Realizar un "Ajuste Físico" y comprobar que el balance concuerde.
   - Revisar el reporte "Inventario Valorizado".
