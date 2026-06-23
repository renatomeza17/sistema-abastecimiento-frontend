import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  children: { label: string; url: string }[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {

  nombreCompleto = '';
  cargo = '';

  menuItems: MenuItem[] = [];
  openMenus: { [key: string]: boolean } = {};

  private menuMap: { [key: string]: MenuItem } = {
    DASHBOARD: {
      label: 'Dashboard',
      icon: 'bi-grid-1x2',
      children: [{ label: 'Dashboard', url: '/dashboard' }],
    },

    USUARIOS: {
      label: 'Usuarios',
      icon: 'bi-people',
      children: [
        { label: 'Gestión de Usuarios', url: '/admin/usuarios' },
        { label: 'Roles y Permisos', url: '/admin/roles' },
      ],
    },

    REQUERIMIENTOS: {
      label: 'Requerimientos y Proformas',
      icon: 'bi-file-earmark-text',
      children: [
        { label: 'Requerimientos', url: '/requerimientos/requerimientos' },
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
        { label: 'Ver Kárdex', url: '/inventario/kardex-lista' },
        { label: 'Nuevo Asiento', url: '/inventario/nuevo-kardex' },
        
      ],
    },
    
    PEDIDOS: {
      label: 'Pedidos Dependencia',
      icon: 'bi-bag',
      children: [
        { label: 'Ver Pedido', url: '/dependencia/registro-pedido' },
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

  constructor(public authService: AuthService) {}

  hasRole(rol: string): boolean {
    return this.authService.hasRole(rol);
  }

  ngOnInit(): void {

    this.nombreCompleto = this.authService.getNombreCompleto();

    const roles = this.authService.getRoles();
    this.cargo = roles.length > 0 ? roles[0] : 'Usuario';

    const modulos = this.authService.getModulos();

    console.log('Módulos del usuario:', modulos);
    console.log('Keys del menuMap:', Object.keys(this.menuMap));

    const vistos = new Set<string>();

    modulos.forEach(mod => {

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

    // Se agrega temporalmente Recepción aunque el usuario no tenga el módulo.
    if (!vistos.has('RECEPCION')) {
      this.menuItems.push(this.menuMap['RECEPCION']);
    }
  }

  toggleMenu(label: string): void {
    this.openMenus[label] = !this.openMenus[label];
  }

  isOpen(label: string): boolean {
    return !!this.openMenus[label];
  }

  logout(): void {
    this.authService.logout();
  }

}