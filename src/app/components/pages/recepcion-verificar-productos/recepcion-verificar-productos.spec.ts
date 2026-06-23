import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RecepcionVerificarProductosComponent } from './recepcion-verificar-productos';
import { Recepcion } from '../../../services/recepcion';

describe('RecepcionVerificarProductosComponent', () => {
  let component: RecepcionVerificarProductosComponent;
  let fixture: ComponentFixture<RecepcionVerificarProductosComponent>;

  const recepcionMock = {
    listarOrdenesParaVerificacion: vi.fn(() => of([])),
    consultarOrden: vi.fn(() => of({})),
    recepcionarOrden: vi.fn(() => of({})),
    registrarPedidoPendiente: vi.fn(() => of({}))
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [RecepcionVerificarProductosComponent],
      providers: [
        { provide: Recepcion, useValue: recepcionMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecepcionVerificarProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar las órdenes al iniciar el componente', () => {
    expect(recepcionMock.listarOrdenesParaVerificacion).toHaveBeenCalled();
  });

  it('debe iniciar sin orden seleccionada', () => {
    expect(component.ordenSeleccionada).toBeUndefined();
    expect(component.ordenes.length).toBe(0);
  });

  it('debe bloquear la confirmación si no todos los productos están verificados', () => {
    component.ordenSeleccionada = {
      idOrden: 1,
      codigo: 'OC-001',
      estado: 'ENVIADA',
      detalles: [
        { id: 10 },
        { id: 20 }
      ]
    } as any;

    component.productosVerificados = {
      10: true,
      20: false
    };

    component.confirmarRecepcion();

    expect(component.error).toBe(
      'Debes verificar todos los productos antes de confirmar la recepción.'
    );

    expect(recepcionMock.recepcionarOrden).not.toHaveBeenCalled();
  });

  it('debe reconocer cuando todos los productos están verificados', () => {
    component.ordenSeleccionada = {
      idOrden: 1,
      detalles: [
        { id: 10 },
        { id: 20 }
      ]
    } as any;

    component.productosVerificados = {
      10: true,
      20: true
    };

    expect(component.todosVerificados()).toBe(true);
  });

  it('debe impedir registrar pedido pendiente si no existen incidencias', () => {
    component.ordenSeleccionada = {
      idOrden: 1,
      detalles: [
        { id: 10 }
      ]
    } as any;

    component.incidencias = {
      10: ''
    };

    component.registrarPedidoPendiente();

    expect(component.error).toBe(
      'Debes registrar al menos una incidencia para marcar pedido pendiente.'
    );

    expect(recepcionMock.registrarPedidoPendiente).not.toHaveBeenCalled();
  });

  it('debe contar las incidencias registradas', () => {
    component.incidencias = {
      1: 'Producto dañado',
      2: '',
      3: 'Cantidad incompleta'
    };

    expect(component.totalIncidencias()).toBe(2);
  });
});