import { Routes } from '@angular/router';
import { Login } from './components/auth//login/login';
import { Dashboard } from './components/pages/dashboard/dashboard';
import { Inventario } from './components/pages/inventario/inventario';
import { UsuariosLista } from './components/admin/usuarios-lista/usuarios-lista';
import { UsuariosForm } from './components/admin/usuarios-form/usuarios-form';
import { MainLayout } from './components/layout/main-layout/main-layout';
import { authGuard } from './guards/auth-guard';
import { OrdenLista } from './components/pages/orden-lista/orden-lista';
import { OrdenDetalle } from './components/pages/orden-detalle/orden-detalle';
import { RequerimientosComponent } from './components/pages/requerimiento/requerimiento';
import { CrearProformaComponent } from './components/pages/crear-proforma/crear-proforma';
import { EvaluarProformasComponent } from './components/pages/evaluar-proformas/evaluar-proformas';
import { FirmaRequerimientosComponent } from './components/pages/firma-requerimiento/firma-requerimiento';

export const routes: Routes = [
    // Ruta independiente
    { path: 'login', component: Login },

    // Ruta con MainLayout
    {
        path: '',
        component: MainLayout,
        canActivate: [authGuard],
        children: [ 
            { path: 'dashboard', component: Dashboard },
            { path: 'inventario', component: Inventario },
            { path: 'admin/usuarios', component: UsuariosLista },
            { path: 'admin/usuarios/nuevo', component: UsuariosForm },
            { path: 'ordenes', component: OrdenLista },
            { path: 'ordenes/:id', component: OrdenDetalle }, 
            { path: 'requerimientos/nuevo', component: RequerimientosComponent },
            { path: 'requerimientos/proformas', component: CrearProformaComponent },
            { path: 'requerimientos/comparar', component: EvaluarProformasComponent },
            { path: 'compras/autorizacion', component: FirmaRequerimientosComponent },

            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    // Ruta por defecto si no encuentra nada
    { path: '**', redirectTo: 'login' }
];