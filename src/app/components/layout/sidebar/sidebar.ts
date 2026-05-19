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
        { label: 'Roles y Permisos', url: '/admin/roles' },
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
    const modulos = this.authService.getModulos();
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
  }

  toggleMenu(label: string): void {
    this.openMenus[label] = !this.openMenus[label];
  }

  isOpen(label: string): boolean {
    return this.openMenus[label];
  }
}