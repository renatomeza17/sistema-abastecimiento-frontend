import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DependenciaRegistroPedidoComponent } from './dependencia-registro-pedido';
import { PedidoService } from '../../../services/pedido.service';
import { ProductoService } from '../../../services/producto.service';
import { of, throwError } from 'rxjs';
import { PedidoResponseDTO } from '../../../api/response/pedido-responseDTO';
import { productoResponseDTO } from '../../../api/response/productoResponseDTO';
import { ItemFilaPedido } from '../../../models/registro_pedido/pedido';

describe('DependenciaRegistroPedidoComponent', () => {
  let component: DependenciaRegistroPedidoComponent;
  let fixture: ComponentFixture<DependenciaRegistroPedidoComponent>;
  let mockPedidoService: any;
  let mockProductoService: any;

  const mockProductos: productoResponseDTO[] = [
    { idProducto: 1, nombre: 'Papel A4', unidadMedida: 'Resma', codigo: 'PAPEL-001', descripcion: 'Papel blanco 80gr', activo: true },
    { idProducto: 2, nombre: 'Bolígrafos Azules', unidadMedida: 'Caja', codigo: 'BOL-002', descripcion: 'Bolígrafos azul punto fino', activo: true },
    { idProducto: 3, nombre: 'Tinta de Impresora', unidadMedida: 'Cartridges', codigo: 'TINTA-003', descripcion: 'Cartridges originales', activo: true }
  ];

  const mockPedidos: PedidoResponseDTO[] = [
    {
      idPedido: 1,
      codigo: 'PED-2026-ABC12',
      descripcion: 'Materiales de oficina',
      estado: 'PENDIENTE',
      fechaCreacion: '2026-06-20',
      nombreSolicitante: 'Juan Pérez',
      detalles: []
    },
    {
      idPedido: 2,
      codigo: 'PED-2026-DEF34',
      descripcion: 'Suministros para impresión',
      estado: 'FINALIZADO',
      fechaCreacion: '2026-06-15',
      nombreSolicitante: 'Juan Pérez',
      detalles: []
    }
  ];

  beforeEach(async () => {
    mockPedidoService = {
      crearPedido: vi.fn().mockReturnValue(of({})),
      listarMisPedidos: vi.fn().mockReturnValue(of(mockPedidos))
    };

    mockProductoService = {
      obtenerCatalogoProductos: vi.fn().mockReturnValue(of(mockProductos))
    };

    await TestBed.configureTestingModule({
      imports: [DependenciaRegistroPedidoComponent],
      providers: [
        { provide: PedidoService, useValue: mockPedidoService },
        { provide: ProductoService, useValue: mockProductoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DependenciaRegistroPedidoComponent);
    component = fixture.componentInstance;
  });

  // ============================================================
  // TESTS DE INICIALIZACIÓN Y CARGA DE DATOS
  // ============================================================

  describe('Inicialización del Componente', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with historial view', () => {
      expect(component.vistaActiva).toBe('historial');
    });

    it('should load historial and productos on ngOnInit', () => {
      fixture.detectChanges();
      expect(mockPedidoService.listarMisPedidos).toHaveBeenCalled();
      expect(mockProductoService.obtenerCatalogoProductos).toHaveBeenCalled();
      expect(component.pedidosHistorial.length).toBe(2);
      expect(component.productosCatalogo.length).toBe(3);
    });

    it('should initialize detallesPedido as empty array', () => {
      expect(component.detallesPedido).toEqual([]);
      expect(Array.isArray(component.detallesPedido)).toBeTruthy();
    });

    it('should initialize form fields with empty/default values', () => {
      expect(component.descripcionGeneral).toBe('');
      expect(component.idProductoSeleccionado).toBe('');
      expect(component.cantidadIngresada).toBe(1);
      expect(component.observacionIndividual).toBe('');
    });
  });

  // ============================================================
  // TESTS DE CAMBIO DE VISTA
  // ============================================================

  describe('Cambio de Vista', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should switch to nuevo view', () => {
      component.cambiarVista('nuevo');
      expect(component.vistaActiva).toBe('nuevo');
    });

    it('should clear pedidoSeleccionado when switching view', () => {
      component.pedidoSeleccionado = mockPedidos[0];
      component.cambiarVista('nuevo');
      expect(component.pedidoSeleccionado).toBeUndefined();
    });

    it('should reload historial and clean form when switching to historial', () => {
      component.descripcionGeneral = 'Test description';
      component.cantidadIngresada = 5;
      component.detallesPedido = [{ idProducto: 1, nombreProducto: 'Test', unidadMedida: 'u', cantidad: 5, observacionEspecifica: 'Test' }];

      component.cambiarVista('historial');

      expect(component.vistaActiva).toBe('historial');
      expect(mockPedidoService.listarMisPedidos).toHaveBeenCalledTimes(2); // Una en ngOnInit, otra en cambiarVista
      expect(component.descripcionGeneral).toBe('');
      expect(component.cantidadIngresada).toBe(1);
      expect(component.detallesPedido).toEqual([]);
    });
  });

  // ============================================================
  // TESTS DE AGREGAR PRODUCTO A LA LISTA
  // ============================================================

  describe('Agregar Producto a Lista', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should add product to detallesPedido with valid data', () => {
      component.idProductoSeleccionado = JSON.stringify(mockProductos[0]);
      component.cantidadIngresada = 5;
      component.observacionIndividual = 'Calidad premium';

      component.agregarProductoALista();

      expect(component.detallesPedido.length).toBe(1);
      expect(component.detallesPedido[0].idProducto).toBe(1);
      expect(component.detallesPedido[0].nombreProducto).toBe('Papel A4');
      expect(component.detallesPedido[0].cantidad).toBe(5);
      expect(component.detallesPedido[0].observacionEspecifica).toBe('Calidad premium');
    });

    it('should reject product when no product selected', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      component.idProductoSeleccionado = '';
      component.cantidadIngresada = 5;

      component.agregarProductoALista();

      expect(component.detallesPedido.length).toBe(0);
      expect(alertSpy).toHaveBeenCalledWith('Debe seleccionar un producto válido y asignar una cantidad mayor a cero.');
      alertSpy.mockRestore();
    });

    it('should reject product when quantity is zero', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      component.idProductoSeleccionado = JSON.stringify(mockProductos[0]);
      component.cantidadIngresada = 0;

      component.agregarProductoALista();

      expect(component.detallesPedido.length).toBe(0);
      expect(alertSpy).toHaveBeenCalledWith('Debe seleccionar un producto válido y asignar una cantidad mayor a cero.');
      alertSpy.mockRestore();
    });

    it('should reject product when quantity is negative', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      component.idProductoSeleccionado = JSON.stringify(mockProductos[0]);
      component.cantidadIngresada = -5;

      component.agregarProductoALista();

      expect(component.detallesPedido.length).toBe(0);
      expect(alertSpy).toHaveBeenCalled();
      alertSpy.mockRestore();
    });

    it('should prevent adding duplicate products', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      component.idProductoSeleccionado = JSON.stringify(mockProductos[0]);
      component.cantidadIngresada = 3;

      component.agregarProductoALista();
      expect(component.detallesPedido.length).toBe(1);

      component.cantidadIngresada = 5;
      component.agregarProductoALista();

      expect(component.detallesPedido.length).toBe(1); // No debe agregar el duplicado
      expect(alertSpy).toHaveBeenCalledWith('Este artículo ya ha sido añadido a la lista actual.');
      alertSpy.mockRestore();
    });

    it('should clear form fields after adding product', () => {
      component.idProductoSeleccionado = JSON.stringify(mockProductos[0]);
      component.cantidadIngresada = 3;
      component.observacionIndividual = 'Especial';

      component.agregarProductoALista();

      expect(component.idProductoSeleccionado).toBe('');
      expect(component.cantidadIngresada).toBe(1);
      expect(component.observacionIndividual).toBe('');
    });

    it('should add multiple different products', () => {
      component.idProductoSeleccionado = JSON.stringify(mockProductos[0]);
      component.cantidadIngresada = 2;
      component.agregarProductoALista();

      component.idProductoSeleccionado = JSON.stringify(mockProductos[1]);
      component.cantidadIngresada = 3;
      component.agregarProductoALista();

      expect(component.detallesPedido.length).toBe(2);
      expect(component.detallesPedido[0].idProducto).toBe(1);
      expect(component.detallesPedido[1].idProducto).toBe(2);
    });
  });

  // ============================================================
  // TESTS DE ELIMINAR PRODUCTO DE LA LISTA
  // ============================================================

  describe('Eliminar Producto de Lista', () => {
    beforeEach(() => {
      fixture.detectChanges();
      // Agregar tres productos
      component.detallesPedido = [
        { idProducto: 1, nombreProducto: 'Papel A4', unidadMedida: 'Resma', cantidad: 5, observacionEspecifica: '' },
        { idProducto: 2, nombreProducto: 'Bolígrafos', unidadMedida: 'Caja', cantidad: 2, observacionEspecifica: '' },
        { idProducto: 3, nombreProducto: 'Tinta', unidadMedida: 'Cartridges', cantidad: 1, observacionEspecifica: '' }
      ];
    });

    it('should remove product at specified index', () => {
      component.eliminarProductoDeLista(1);
      expect(component.detallesPedido.length).toBe(2);
      expect(component.detallesPedido[0].idProducto).toBe(1);
      expect(component.detallesPedido[1].idProducto).toBe(3);
    });

    it('should remove first product', () => {
      component.eliminarProductoDeLista(0);
      expect(component.detallesPedido.length).toBe(2);
      expect(component.detallesPedido[0].idProducto).toBe(2);
    });

    it('should remove last product', () => {
      component.eliminarProductoDeLista(2);
      expect(component.detallesPedido.length).toBe(2);
      expect(component.detallesPedido[1].idProducto).toBe(2);
    });
  });

  // ============================================================
  // TESTS DE GUARDAR PEDIDO COMPLETO
  // ============================================================

  describe('Guardar Pedido Completo', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should reject when description is empty', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      component.descripcionGeneral = '';
      component.detallesPedido = [{ idProducto: 1, nombreProducto: 'Test', unidadMedida: 'u', cantidad: 1, observacionEspecifica: '' }];

      component.guardarPedidoCompleto();

      expect(alertSpy).toHaveBeenCalledWith('La justificación o descripción del pedido es requerida.');
      expect(mockPedidoService.crearPedido).not.toHaveBeenCalled();
      alertSpy.mockRestore();
    });

    it('should reject when description is only whitespace', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      component.descripcionGeneral = '   ';
      component.detallesPedido = [{ idProducto: 1, nombreProducto: 'Test', unidadMedida: 'u', cantidad: 1, observacionEspecifica: '' }];

      component.guardarPedidoCompleto();

      expect(alertSpy).toHaveBeenCalledWith('La justificación o descripción del pedido es requerida.');
      alertSpy.mockRestore();
    });

    it('should reject when detallesPedido is empty', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      component.descripcionGeneral = 'Necesito materiales';
      component.detallesPedido = [];

      component.guardarPedidoCompleto();

      expect(alertSpy).toHaveBeenCalledWith('La solicitud debe contener al menos un artículo.');
      expect(mockPedidoService.crearPedido).not.toHaveBeenCalled();
      alertSpy.mockRestore();
    });

    it('should create pedido with valid data', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const mockResponse: PedidoResponseDTO = {
        idPedido: 1,
        codigo: 'PED-2026-ABC12',
        descripcion: 'Materiales',
        estado: 'PENDIENTE',
        fechaCreacion: '2026-06-23',
        nombreSolicitante: 'Test User',
        detalles: []
      };
      mockPedidoService.crearPedido.mockReturnValue(of(mockResponse));

      component.descripcionGeneral = 'Materiales de oficina';
      component.detallesPedido = [
        { idProducto: 1, nombreProducto: 'Papel', unidadMedida: 'Resma', cantidad: 5, observacionEspecifica: 'Blanco' }
      ];

      component.guardarPedidoCompleto();

      expect(mockPedidoService.crearPedido).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Pedido enviado a procesamiento de abastecimiento correctamente.');
      alertSpy.mockRestore();
    });

    it('should switch to historial view after successful creation', async () => {
      const mockResponse: PedidoResponseDTO = mockPedidos[0];
      mockPedidoService.crearPedido.mockReturnValue(of(mockResponse));

      component.descripcionGeneral = 'Test';
      component.detallesPedido = [{ idProducto: 1, nombreProducto: 'Test', unidadMedida: 'u', cantidad: 1, observacionEspecifica: '' }];
      component.vistaActiva = 'nuevo';

      component.guardarPedidoCompleto();

      await new Promise<void>((resolve) => setTimeout(() => {
        expect(component.vistaActiva).toBe('historial');
        resolve();
      }, 50));
    });

    it('should handle server error gracefully', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const errorResponse = new Error('Server error');
      mockPedidoService.crearPedido.mockReturnValue(throwError(() => errorResponse));

      component.descripcionGeneral = 'Test';
      component.detallesPedido = [{ idProducto: 1, nombreProducto: 'Test', unidadMedida: 'u', cantidad: 1, observacionEspecifica: '' }];

      component.guardarPedidoCompleto();

      expect(alertSpy).toHaveBeenCalledWith('No se pudo registrar el pedido en el servidor.');
      alertSpy.mockRestore();
    });

    it('should map detallesPedido correctly to DTO', () => {
      const mockResponse: PedidoResponseDTO = mockPedidos[0];
      mockPedidoService.crearPedido.mockReturnValue(of(mockResponse));

      component.descripcionGeneral = 'Test description';
      component.detallesPedido = [
        { idProducto: 1, nombreProducto: 'Papel', unidadMedida: 'Resma', cantidad: 5, observacionEspecifica: 'Blanco 80gr' },
        { idProducto: 2, nombreProducto: 'Bolígrafos', unidadMedida: 'Caja', cantidad: 2, observacionEspecifica: '' }
      ];

      component.guardarPedidoCompleto();

      const calls = mockPedidoService.crearPedido.mock.calls;
      const callArgument = calls[calls.length - 1][0];
      expect(callArgument.descripcion).toBe('Test description');
      expect(callArgument.detalles.length).toBe(2);
      expect(callArgument.detalles[0].idProducto).toBe(1);
      expect(callArgument.detalles[0].cantidad).toBe(5);
      expect(callArgument.detalles[0].observacionEspecifica).toBe('Blanco 80gr');
      expect(callArgument.detalles[1].observacionEspecifica).toBeUndefined();
    });
  });

  // ============================================================
  // TESTS DE VER DETALLES
  // ============================================================

  describe('Ver Detalles de Pedido', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should set pedidoSeleccionado when viewing details', async () => {
      component.verDetalles(mockPedidos[0]);

      await new Promise<void>((resolve) => setTimeout(() => {
        expect(component.pedidoSeleccionado).toBe(mockPedidos[0]);
        resolve();
      }, 150));
    });

    it('should clear pedidoSeleccionado when closing details', () => {
      component.pedidoSeleccionado = mockPedidos[0];
      component.cerrarDetalles();
      expect(component.pedidoSeleccionado).toBeUndefined();
    });
  });

  // ============================================================
  // TESTS DE LIMPIAR FORMULARIO
  // ============================================================

  describe('Limpiar Formulario', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should clear all form fields', () => {
      component.descripcionGeneral = 'Test';
      component.detallesPedido = [{ idProducto: 1, nombreProducto: 'Test', unidadMedida: 'u', cantidad: 5, observacionEspecifica: 'Obs' }];
      component.idProductoSeleccionado = JSON.stringify(mockProductos[0]);
      component.cantidadIngresada = 10;
      component.observacionIndividual = 'Observación';

      component.limpiarFormulario();

      expect(component.descripcionGeneral).toBe('');
      expect(component.detallesPedido).toEqual([]);
      expect(component.idProductoSeleccionado).toBe('');
      expect(component.cantidadIngresada).toBe(1);
      expect(component.observacionIndividual).toBe('');
    });
  });

  // ============================================================
  // TESTS DE MANEJO DE ERRORES
  // ============================================================

  describe('Manejo de Errores en Carga de Datos', () => {
    it('should handle error when loading historial', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockPedidoService.listarMisPedidos.mockReturnValue(throwError(() => new Error('API error')));

      component.cargarHistorial();

      expect(consoleSpy).toHaveBeenCalledWith('Error al recuperar historial de pedidos', expect.any(Error));
      expect(component.pedidosHistorial.length).toBe(0);
      consoleSpy.mockRestore();
    });

    it('should handle error when loading productos', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockProductoService.obtenerCatalogoProductos.mockReturnValue(throwError(() => new Error('API error')));

      component.cargarProductosCatalogo();

      expect(consoleSpy).toHaveBeenCalledWith('Error al recuperar catálogo de productos', expect.any(Error));
      expect(component.productosCatalogo.length).toBe(0);
      consoleSpy.mockRestore();
    });
  });
});
