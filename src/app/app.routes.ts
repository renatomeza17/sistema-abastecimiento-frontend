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

      // Redirección por defecto dentro del Layout
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Comodín para rutas no encontradas (Opcional pero recomendado)
  { path: '**', redirectTo: 'login' }
];