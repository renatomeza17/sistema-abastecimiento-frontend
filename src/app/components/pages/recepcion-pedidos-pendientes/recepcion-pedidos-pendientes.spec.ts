import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RecepcionPedidosPendientesComponent } from './recepcion-pedidos-pendientes';
import { Recepcion } from '../../../services/recepcion';

describe('RecepcionPedidosPendientesComponent', () => {
  let component: RecepcionPedidosPendientesComponent;
  let fixture: ComponentFixture<RecepcionPedidosPendientesComponent>;

  const pedidosMock = [
    {
      idPedidoPendiente: 1,
      estado: 'PENDIENTE',
      motivo: 'Producto dañado',
      ordenCompra: {
        codigo: 'OC-001',
        proveedor: {
          razonSocial: 'Proveedor Lima SAC'
        }
      }
    },
    {
      idPedidoPendiente: 2,
      estado: 'RESUELTO',
      motivo: 'Cantidad incompleta',
      ordenCompra: {
        codigo: 'OC-002',
        proveedor: {
          razonSocial: 'Distribuidora Norte'
        }
      }
    },
    {
      idPedidoPendiente: 3,
      estado: 'EN_PROCESO',
      motivo: 'Reposición pendiente',
      ordenCompra: {
        codigo: 'OC-003',
        proveedor: {
          razonSocial: 'Proveedor Sur'
        }
      }
    }
  ];

  const recepcionMock = {
    listarPedidosPendientes: vi.fn(() => of(pedidosMock)),
    resolverPedidoPendiente: vi.fn(() => of({}))
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    recepcionMock.listarPedidosPendientes.mockReturnValue(of(pedidosMock));
    recepcionMock.resolverPedidoPendiente.mockReturnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [RecepcionPedidosPendientesComponent],
      providers: [
        provideRouter([]),
        { provide: Recepcion, useValue: recepcionMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecepcionPedidosPendientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar los pedidos pendientes al iniciar', () => {
    expect(recepcionMock.listarPedidosPendientes).toHaveBeenCalled();
    expect(component.pedidos.length).toBe(3);
    expect(component.error).toBe('');
    expect(component.cargando).toBe(false);
  });

  it('debe mostrar error si no se pueden cargar los pedidos pendientes', () => {
    recepcionMock.listarPedidosPendientes.mockReturnValue(
      throwError(() => new Error('Error de carga'))
    );

    component.cargarPedidos();

    expect(component.pedidos).toEqual([]);
    expect(component.error).toBe('No se pudieron cargar los pedidos pendientes.');
    expect(component.cargando).toBe(false);
  });

  it('debe filtrar pedidos por código de orden de compra', () => {
    component.busqueda = 'OC-001';

    const resultado = component.pedidosFiltrados();

    expect(resultado.length).toBe(1);
    expect(resultado[0].ordenCompra.codigo).toBe('OC-001');
  });

  it('debe filtrar pedidos por proveedor', () => {
    component.busqueda = 'norte';

    const resultado = component.pedidosFiltrados();

    expect(resultado.length).toBe(1);
    expect(resultado[0].ordenCompra.proveedor.razonSocial).toBe('Distribuidora Norte');
  });

  it('debe filtrar pedidos por motivo', () => {
    component.busqueda = 'dañado';

    const resultado = component.pedidosFiltrados();

    expect(resultado.length).toBe(1);
    expect(resultado[0].motivo).toBe('Producto dañado');
  });

  it('debe filtrar pedidos por estado', () => {
    component.estadoFiltro = 'RESUELTO';

    const resultado = component.pedidosFiltrados();

    expect(resultado.length).toBe(1);
    expect(resultado[0].estado).toBe('RESUELTO');
  });

  it('debe seleccionar un pedido pendiente', () => {
    const pedido = pedidosMock[0];

    component.seleccionarPedido(pedido);

    expect(component.pedidoSeleccionado).toEqual(pedido);
  });

  it('debe cancelar la resolución si el usuario no confirma', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.resolverPedido(pedidosMock[0]);

    expect(recepcionMock.resolverPedidoPendiente).not.toHaveBeenCalled();
  });

  it('debe resolver un pedido pendiente cuando el usuario confirma', () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true);

  const cargarPedidosSpy = vi
    .spyOn(component, 'cargarPedidos')
    .mockImplementation(() => {});

  component.pedidoSeleccionado = pedidosMock[0];

  component.resolverPedido(pedidosMock[0]);

  expect(recepcionMock.resolverPedidoPendiente).toHaveBeenCalledWith(1);
  expect(component.mensaje).toBe('Pedido resuelto correctamente.');
  expect(component.pedidoSeleccionado).toBeUndefined();
  expect(cargarPedidosSpy).toHaveBeenCalled();
});

  it('debe mostrar error si no se puede resolver el pedido pendiente', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    recepcionMock.resolverPedidoPendiente.mockReturnValue(
      throwError(() => new Error('Error al resolver'))
    );

    component.resolverPedido(pedidosMock[0]);

    expect(component.error).toBe('No se pudo resolver el pedido.');
  });

  it('debe calcular el total de pedidos pendientes', () => {
    expect(component.totalPendientes()).toBe(1);
  });

  it('debe calcular el total de pedidos resueltos', () => {
    expect(component.totalResueltos()).toBe(1);
  });

  it('debe calcular el total de pedidos en proceso', () => {
    expect(component.totalEnProceso()).toBe(1);
  });
});