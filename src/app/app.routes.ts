import { Routes } from '@angular/router';

import { Login } from './components/auth/login/login';
import { LandingComponent } from './components/pages/landing/landing';

import { Dashboard } from './components/pages/dashboard/dashboard';
import { Inventario } from './components/pages/inventario/inventario';

import { UsuariosLista } from './components/admin/usuarios-lista/usuarios-lista';
import { UsuariosForm } from './components/admin/usuarios-form/usuarios-form';

import { MainLayout } from './components/layout/main-layout/main-layout';
import { authGuard } from './guards/auth-guard';

import { OrdenLista } from './components/pages/orden-lista/orden-lista';
import { OrdenDetalle } from './components/pages/orden-detalle/orden-detalle';
import { OrdenForm } from './components/pages/orden-form/orden-form';

import { RequerimientosComponent } from './components/pages/requerimiento-lista-requerimientos/lista-requerimientos';
import { CrearProformaComponent } from './components/pages/requerimiento-proformas/requerimiento-proformas';
import { EvaluarProformasComponent } from './components/pages/requerimiento-comparar-proformas/requerimiento-comparar-proformas';

import { RecepcionVerificarProductosComponent } from './components/pages/recepcion-verificar-productos/recepcion-verificar-productos';
import { RecepcionPedidosPendientesComponent } from './components/pages/recepcion-pedidos-pendientes/recepcion-pedidos-pendientes';

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full' },
  { path: 'login', component: Login },

  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'inventario', component: Inventario },

      { path: 'admin/usuarios', component: UsuariosLista },
      { path: 'admin/usuarios/nuevo', component: UsuariosForm },
      { path: 'admin/roles', component: UsuariosForm },

      { path: 'compras/lista', component: OrdenLista },
      { path: 'compras/nueva', component: OrdenForm },
      { path: 'compras/ordenes/:id', component: OrdenDetalle },

      { path: 'requerimientos/requerimientos', component: RequerimientosComponent },
      { path: 'requerimientos/proformas', component: CrearProformaComponent },
      { path: 'requerimientos/comparar', component: EvaluarProformasComponent },

      { path: 'recepcion/verificar', component: RecepcionVerificarProductosComponent },
      { path: 'recepcion/pendientes', component: RecepcionPedidosPendientesComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '' }
];