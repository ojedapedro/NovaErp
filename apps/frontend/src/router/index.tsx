import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useAuthStore } from '../store/authStore';

import { Login } from '../pages/Login';

import { Dashboard } from '../pages/Dashboard';
import { Asientos } from '../pages/contabilidad/Asientos';
import { NuevoAsiento } from '../pages/contabilidad/NuevoAsiento';
import { PlanCuentas } from '../pages/contabilidad/PlanCuentas';
import { BalanceComprobacion } from '../pages/contabilidad/BalanceComprobacion';
import { Clientes } from '../pages/facturacion/Clientes';
import { Productos } from '../pages/facturacion/Productos';
import { Facturas } from '../pages/facturacion/Facturas';
import { NuevaFactura } from '../pages/facturacion/NuevaFactura';
import { LibroVentas } from '../pages/iva/LibroVentas';
import { LibroCompras } from '../pages/iva/LibroCompras';
import { Proveedores } from '../pages/compras/Proveedores';
import { FacturasCompras } from '../pages/compras/FacturasCompras';
import { Kardex } from '../pages/inventario/Kardex';
import { Valorizado } from '../pages/inventario/Valorizado';
import { Ajustes } from '../pages/inventario/Ajustes';
import { RetencionesIva } from '../pages/retenciones/RetencionesIva';
import { RetencionesIslr } from '../pages/retenciones/RetencionesIslr';
import { Cobros } from '../pages/cxc/Cobros';
import { Pagos } from '../pages/cxp/Pagos';
import { NominaBase } from '../pages/nomina/Nomina';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuthStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'contabilidad/asientos',
        element: <Asientos />,
      },
      {
        path: 'contabilidad/asientos/nuevo',
        element: <NuevoAsiento />,
      },
      {
        path: 'contabilidad/cuentas',
        element: <PlanCuentas />,
      },
      {
        path: 'contabilidad/balance-comprobacion',
        element: <BalanceComprobacion />,
      },
      {
        path: 'facturacion/clientes',
        element: <Clientes />,
      },
      {
        path: 'facturacion/productos',
        element: <Productos />,
      },
      {
        path: 'facturacion/facturas',
        element: <Facturas />,
      },
      {
        path: 'facturacion/facturas/nueva',
        element: <NuevaFactura />,
      },
      {
        path: 'iva/libro-ventas',
        element: <LibroVentas />,
      },
      {
        path: 'iva/libro-compras',
        element: <LibroCompras />,
      },
      {
        path: 'compras/proveedores',
        element: <Proveedores />,
      },
            {
        path: 'compras/facturas',
        element: <FacturasCompras />,
      },
      {
        path: 'inventario/kardex',
        element: <Kardex />,
      },
      {
        path: 'inventario/valorizado',
        element: <Valorizado />,
      },
      {
        path: 'inventario/ajustes',
        element: <Ajustes />,
      },
      {
        path: 'retenciones/iva',
        element: <RetencionesIva />,
      },
      {
        path: 'retenciones/islr',
        element: <RetencionesIslr />,
      },
      {
        path: 'cxc',
        element: <Cobros />,
      },
      {
        path: 'cxp',
        element: <Pagos />,
      },
      {
        path: 'nomina',
        element: <NominaBase />,
      },
    ],
  },
]);
