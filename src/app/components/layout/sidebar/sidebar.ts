import { Component, OnInit } from '@angular/core';
<<<<<<< HEAD
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  children: { label: string; url: string }[];
}
=======
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service'; /* Ajusta los '../' según tu ruta real al servicio */
>>>>>>> 3b7b9e694748a57a990c396bd8736e2f3fa0baf2

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {

<<<<<<< HEAD
  nombreCompleto = '';
  cargo = '';
=======
>>>>>>> 3b7b9e694748a57a990c396bd8736e2f3fa0baf2
  menuItems: MenuItem[] = [];
  openMenus: { [key: string]: boolean } = {};

  private menuMap: { [key: string]: MenuItem } = {
    DASHBOARD: {
      label: 'Dashboard',
      icon: 'bi-grid-1x2',
      children: [{ label: 'Dashboard', url: '/dashboard' }],
    },
    USUARIOS: {
      label: 'Administración',
      icon: 'bi-people',
      children: [
        { label: 'Gestión de Usuarios', url: '/admin/usuarios' },
<<<<<<< HEAD
        // Corregido: Ahora apunta a la ruta que configuramos en app.routes.ts
        { label: 'Roles y Permisos', url: '/admin/roles' }, 
=======
        { label: 'Roles y Permisos', url: '/admin/roles' },
>>>>>>> 3b7b9e694748a57a990c396bd8736e2f3fa0baf2
      ],
    },
    REQUERIMIENTOS: {
      label: 'Requerimientos',
      icon: 'bi-file-earmark-text',
      children: [
        { label: 'Nuevo Requerimiento', url: '/requerimientos/nuevo' },
        { label: 'Lista de Requerimientos', url: '/requerimientos/lista' },
        { label: 'Proformas', url: '/requerimientos/proformas' },
        { label: 'Comparar Proformas', url: '/requerimientos/comparar' },
      ],
    },
    COMPRAS: {
      label: 'Órdenes de Compra',
      icon: 'bi-cart3',
      children: [
        { label: 'Nueva Orden', url: '/compras/nueva' },
        { label: 'Lista de Órdenes', url: '/compras/lista' },
        { label: 'Autorización OC', url: '/compras/autorizacion' },
        { label: 'Reprogramar/Cancelar', url: '/compras/reprogramar' },
      ],
    },
    RECEPCION: {
      label: 'Recepción',
      icon: 'bi-box-seam',
      children: [
        { label: 'Verificar Productos', url: '/recepcion/verificar' },
        { label: 'Pedidos Pendientes', url: '/recepcion/pendientes' },
      ],
    },
    INVENTARIO: {
      label: 'Kárdex',
      icon: 'bi-journal-text',
      children: [
        { label: 'Ver Kárdex', url: '/inventario/kardex' },
        { label: 'Nuevo Asiento', url: '/inventario/nuevo' },
        { label: 'Ficha Técnica', url: '/inventario/ficha' },
      ],
    },
    PEDIDOS: {
      label: 'Pedidos Dependencia',
      icon: 'bi-bag',
      children: [
        { label: 'Nuevo Pedido', url: '/pedidos/nuevo' },
        { label: 'Lista de Pedidos', url: '/pedidos/lista' },
        { label: 'Verificar Existencia', url: '/pedidos/verificar' },
      ],
    },
    PECOSA: {
      label: 'PECOSA',
      icon: 'bi-file-earmark-check',
      children: [
        { label: 'Generar PECOSA', url: '/pecosa/generar' },
        { label: 'Validar y Firmar', url: '/pecosa/validar' },
        { label: 'Lista PECOSA', url: '/pecosa/lista' },
      ],
    },
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
<<<<<<< HEAD
    this.nombreCompleto = this.authService.getNombreCompleto();
    const roles = this.authService.getRoles();
    this.cargo = roles.length > 0 ? roles[0] : 'Usuario';

=======
>>>>>>> 3b7b9e694748a57a990c396bd8736e2f3fa0baf2
    const modulos = this.authService.getModulos();
    const vistos = new Set<string>();

    modulos.forEach(mod => {
<<<<<<< HEAD
      // Importante: Asegúrate que el backend envíe "USUARIOS" o "ADMINISTRACION"
=======
>>>>>>> 3b7b9e694748a57a990c396bd8736e2f3fa0baf2
      const key = mod.descripcion.toUpperCase();
      const item = this.menuMap[key];
      if (item && !vistos.has(key)) {
        vistos.add(key);
        this.menuItems.push({ ...item });
        this.openMenus[item.label] = false;
      }
    });

    if (!vistos.has('DASHBOARD')) {
      this.menuItems.unshift(this.menuMap['DASHBOARD']);
    }
  }

  toggleMenu(label: string): void {
    this.openMenus[label] = !this.openMenus[label];
  }

  isOpen(label: string): boolean {
<<<<<<< HEAD
    return !!this.openMenus[label];
  }

  logout(): void {
    this.authService.logout();
  }
}
=======
    return this.openMenus[label];
  }
}
>>>>>>> 3b7b9e694748a57a990c396bd8736e2f3fa0baf2
