import { Routes } from '@angular/router';
import { Login} from './components/auth//login/login';
import { Dashboard } from './components/pages/dashboard/dashboard';
import { Inventario } from './components/pages/inventario/inventario';
import { UsuariosLista } from './components/admin/usuarios-lista/usuarios-lista';
import { UsuariosForm } from './components/admin/usuarios-form/usuarios-form';
import { MainLayout } from './components/layout/main-layout/main-layout';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    //Ruta independiente
    { path: 'login', component: Login },

    //Ruta con MainLayout
    {
        path:'',
        component: MainLayout,
        canActivate: [authGuard], // Aquí puedes agregar guardias de ruta si es necesario
        children: [ 
            {path: 'dashboard', component: Dashboard },
            {path: 'inventario', component: Inventario },
            {path: 'admin/usuarios', component: UsuariosLista },
            {path: 'admin/usuarios/nuevo', component: UsuariosForm },
            {path: '', redirectTo: 'dashboard', pathMatch: 'full' }


        ]

    },

    //Ruta por defecto si no encuentra nada
    {path: '**', redirectTo: 'login' }

];
