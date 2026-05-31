import { Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { Dashboard } from './components/pages/dashboard/dashboard';
import { Inventario } from './components/pages/inventario/inventario';
import { UsuariosLista } from './components/admin/usuarios-lista/usuarios-lista';
import { UsuariosForm } from './components/admin/usuarios-form/usuarios-form';
import { MainLayout } from './components/layout/main-layout/main-layout';
import { authGuard } from './guards/auth-guard';
// Importa el componente donde tienes las tarjetas de roles
// import { RolesLista } from './components/admin/roles-lista/roles-lista'; 
import { OrdenLista } from './components/pages/orden-lista/orden-lista';
import { OrdenDetalle } from './components/pages/orden-detalle/orden-detalle';
import { OrdenForm } from './components/pages/orden-form/orden-form';
import { RequerimientosComponent } from './components/pages/requerimiento/requerimiento';
import { CrearProformaComponent } from './components/pages/crear-proforma/crear-proforma';

export const routes: Routes = [
  // Ruta independiente
  { path: 'login', component: Login },

  // Rutas con MainLayout (Sidebar + Navbar)
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'inventario', component: Inventario },
      
      // Gestión de Usuarios
      { path: 'admin/usuarios', component: UsuariosLista },
      { path: 'admin/usuarios/nuevo', component: UsuariosForm },
      
      // Gestión de Roles (La que pediste para el sidebar)
      // Asegúrate de cambiar 'UsuariosLista' por el componente de tus tarjetas si es distinto
      { path: 'admin/roles', component: UsuariosForm }, 
      {path: 'compras/lista', component: OrdenLista },
      { path: 'compras/nueva', component: OrdenForm },
      {path: 'compras/ordenes/:id', component: OrdenDetalle },
      {path: 'requerimientos/nuevo', component:RequerimientosComponent},
      {path: 'requerimientos/elegidas', component: CrearProformaComponent},

     


      // { 
      //   path: 'ordenes/detalle/:id', 
      //   component: OrdenDetalle,
      //   // canActivate: [roleGuard], // Si usas guardias de seguridad
      //   data: { expectedRoles: ['ROLE_JEFE_ABASTECIMIENTO', 'ROLE_DIRECTOR_ADMIN'] } // Los que pueden verla
      // },
      // Redirección por defecto dentro del Layout
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Comodín para rutas no encontradas (Opcional pero recomendado)
  { path: '**', redirectTo: 'login' }
];

