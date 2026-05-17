import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface StatCard {
  value: number;
  label: string;
  icon: string;
  trend: string;
  trendUp: boolean;
}

interface OrdenReciente {
  codigo: string;
  proveedor: string;
  monto: number;
  estado: 'Aprobada' | 'Pendiente' | 'En Proceso' | 'Rechazada';
  fecha: string;
}

interface TareaPendiente {
  descripcion: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  cuando: string;
}

interface StockAlerta {
  producto: string;
  actual: number;
  minimo: number;
  unidad: string;
  porcentaje: number;
}

interface AccesoRapido {
  label: string;
  sub: string;
  icon: string;
  url: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {

  nombreCompleto = '';

  stats: StatCard[] = [
    { value: 24, label: 'Órdenes Activas',    icon: 'bi-cart3',              trend: '+12%', trendUp: true  },
    { value: 8,  label: 'Stock Bajo',          icon: 'bi-exclamation-triangle', trend: '-3',   trendUp: false },
    { value: 12, label: 'PECOSA Pendientes',   icon: 'bi-file-earmark-check', trend: '+5',   trendUp: true  },
    { value: 156,label: 'Entregas del Mes',    icon: 'bi-arrow-repeat',       trend: '+23%', trendUp: true  },
  ];

  ordenes: OrdenReciente[] = [
    { codigo: 'OC-2024-001', proveedor: 'Distribuidora ABC', monto: 12450, estado: 'Aprobada',   fecha: '15/01/2024' },
    { codigo: 'OC-2024-002', proveedor: 'Suministros XYZ',   monto: 8320,  estado: 'Pendiente',  fecha: '14/01/2024' },
    { codigo: 'OC-2024-003', proveedor: 'Comercial Lima',    monto: 5780,  estado: 'En Proceso', fecha: '13/01/2024' },
    { codigo: 'OC-2024-004', proveedor: 'Importadora Norte', monto: 15600, estado: 'Rechazada',  fecha: '12/01/2024' },
    { codigo: 'OC-2024-005', proveedor: 'Mayorista Sur',     monto: 3200,  estado: 'Aprobada',   fecha: '11/01/2024' },
  ];

  tareas: TareaPendiente[] = [
    { descripcion: 'Revisar proforma de útiles de oficina', prioridad: 'Alta',  cuando: 'Hoy'        },
    { descripcion: 'Firmar OC-2024-002',                    prioridad: 'Media', cuando: 'Mañana'     },
    { descripcion: 'Verificar entrega de equipos',          prioridad: 'Alta',  cuando: 'Hoy'        },
    { descripcion: 'Generar PECOSA para Facultad de Letras',prioridad: 'Baja',  cuando: 'Esta semana'},
  ];

  alertasStock: StockAlerta[] = [
    { producto: 'Papel Bond A4',   actual: 50,  minimo: 200, unidad: 'Millares', porcentaje: 25 },
    { producto: 'Tóner HP 85A',    actual: 5,   minimo: 20,  unidad: 'Unidades', porcentaje: 25 },
    { producto: 'Archivadores',    actual: 15,  minimo: 50,  unidad: 'Unidades', porcentaje: 30 },
    { producto: 'Clips Metálicos', actual: 8,   minimo: 30,  unidad: 'Cajas',    porcentaje: 27 },
  ];

  accesosRapidos: AccesoRapido[] = [
    { label: 'Nuevo Requerimiento', sub: 'Crear solicitud',    icon: 'bi-file-earmark-plus', url: '/requerimientos/nuevo', color: '#3b82f6' },
    { label: 'Nueva Orden',         sub: 'Generar OC',         icon: 'bi-cart-plus',         url: '/compras/nueva',        color: '#22c55e' },
    { label: 'Generar PECOSA',      sub: 'Autorizar salida',   icon: 'bi-file-earmark-check',url: '/pecosa/generar',       color: '#a855f7' },
    { label: 'Ver Kárdex',          sub: 'Control de stock',   icon: 'bi-journal-text',      url: '/inventario/kardex',    color: '#f59e0b' },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.nombreCompleto = this.authService.getNombreCompleto();
  }

  estadoBadge(estado: string): string {
    const map: { [k: string]: string } = {
      'Aprobada':   'badge-aprobada',
      'Pendiente':  'badge-pendiente',
      'En Proceso': 'badge-proceso',
      'Rechazada':  'badge-rechazada',
    };
    return map[estado] || '';
  }

  prioridadClass(p: string): string {
    const map: { [k: string]: string } = {
      'Alta': 'prio-alta', 'Media': 'prio-media', 'Baja': 'prio-baja'
    };
    return map[p] || '';
  }
}