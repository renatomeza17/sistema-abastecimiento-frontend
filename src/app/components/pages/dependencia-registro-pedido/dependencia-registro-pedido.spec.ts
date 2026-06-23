import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DependenciaRegistroPedidoComponent } from './dependencia-registro-pedido';
import { PedidoService } from '../../../services/pedido.service';
import { ProductoService } from '../../../services/producto.service';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PedidoResponseDTO } from '../../../api/response/pedido-responseDTO';
import { productoResponseDTO } from '../../../api/response/productoResponseDTO';

describe('DependenciaRegistroPedidoComponent', () => {
  let component: DependenciaRegistroPedidoComponent;
  let fixture: ComponentFixture<DependenciaRegistroPedidoComponent>;
  
  // Mocks de datos de ejemplo
  const mockHistorial: PedidoResponseDTO[] = [
    {
      idPedido: 1,
      codigo: 'PED-001',
      descripcion: 'Útiles de oficina mensuales',
      estado: 'PENDIENTE',
      fechaCreacion: '2026-06-23T10:00:00Z',
      nombreSolicitante: 'Mitchell Sihuincha',
      detalles: [
        { idDetallePedido: 10, idProducto: 101, nombreProducto: 'Lapicero Azul', unidadMedida: 'UNIDAD', cantidad: 5 }
      ]
    }
  ];

  const mockProductos: productoResponseDTO[] = [
    { idProducto: 101, codigo: 'PROD-A', nombre: 'Lapicero Azul', descripcion: 'Tinta gel', unidadMedida: 'UNIDAD', activo: true },
    { idProducto: 102, codigo: 'PROD-B', nombre: 'Cuaderno A4', descripcion: 'Cuadriculado', unidadMedida: 'UNIDAD', activo: true }
  ];

  // Definición de Spies/Mocks para los servicios
  const pedidoServiceMock = {
    listarMisPedidos: vi.fn(() => of(mockHistorial)),
    crearPedido: vi.fn(() => of(mockHistorial[0]))
  };

  const productoServiceMock = {
    obtenerCatalogoProductos: vi.fn(() => of(mockProductos))
  };

  beforeEach(async () => {
    // Espías globales de ventanas nativas del navegador
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        DependenciaRegistroPedidoComponent // Al ser standalone se importa aquí
      ],
      providers: [
        { provide: PedidoService, useValue: pedidoServiceMock },
        { provide: ProductoService, useValue: productoServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DependenciaRegistroPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // --- Pruebas de Inicialización ---
  describe('Inicialización', () => {
    it('debería crear el componente e inicializar datos maestros', () => {
      expect(component).toBeTruthy();
      expect(component.vistaActiva).toBe('historial');
      expect(component.pedidosHistorial).toEqual(mockHistorial);
      expect(component.productosCatalogo).toEqual(mockProductos);
    });

    it('debería inicializar los formularios reactivos vacíos y con valores por defecto', () => {
      expect(component.pedidoForm).toBeDefined();
      expect(component.articuloForm).toBeDefined();
      expect(component.articuloForm.get('cantidadIngresada')?.value).toBe(1);
    });
  });

  // --- Pruebas de Navegación y Flujo de Pantallas ---
  describe('Manejo de Vistas', () => {
    it('debería cambiar de vista, limpiar formularios y recargar el historial', () => {
      component.cambiarVista('nuevo');
      expect(component.vistaActiva).toBe('nuevo');
      expect(component.pedidoSeleccionado).toBeUndefined();

      // Forzar ensuciar el formulario
      component.pedidoForm.patchValue({ descripcionGeneral: 'Texto de prueba para justificar' });
      
      component.cambiarVista('historial');
      expect(component.vistaActiva).toBe('historial');
      expect(component.pedidoForm.get('descripcionGeneral')?.value).toBeNull(); // Reseteado
      expect(pedidoServiceMock.listarMisPedidos).toHaveBeenCalledTimes(2); // init + cambiarVista
    });

    it('debería abrir y cerrar la sección de detalles de un pedido', () => {
      vi.useFakeTimers();

      const pedidoMock = mockHistorial[0];
      
      // 1. Creamos el elemento dummy
      const dummyElement = document.createElement('div');
      
      // 2. Le asignamos explícitamente una función para que EXISTA en el entorno de pruebas
      dummyElement.scrollIntoView = () => {}; 
      
      // 3. Ahora sí podemos espiarla sin problemas
      const scrollSpy = vi.spyOn(dummyElement, 'scrollIntoView');
      
      // Forzamos a getElementById a devolver nuestro elemento preparado
      vi.spyOn(document, 'getElementById').mockReturnValue(dummyElement);

      // Ejecutamos el método del componente
      component.verDetalles(pedidoMock);
      expect(component.pedidoSeleccionado).toEqual(pedidoMock);

      // Avanzamos el tiempo para que se ejecute el setTimeout(..., 100)
      vi.advanceTimersByTime(100);

      // Verificamos que se haya llamado
      expect(scrollSpy).toHaveBeenCalled();

      // Probamos que limpie el estado al cerrar
      component.cerrarDetalles();
      expect(component.pedidoSeleccionado).toBeUndefined();

      vi.useRealTimers();
    });
  });

  // --- Pruebas de Validaciones en Formularios ---
  describe('Validación de Formularios', () => {
    it('debería invalidar la descripción general si tiene menos de 10 caracteres o está vacía', () => {
      const control = component.pedidoForm.get('descripcionGeneral');

      control?.setValue('');
      expect(control?.valid).toBeFalsy();

      control?.setValue('   '); // Espacios en blanco
      expect(control?.valid).toBeFalsy();

      control?.setValue('Corto'); // Menos de 10 chars
      expect(control?.valid).toBeFalsy();

      control?.setValue('Esta es una justificación válida de más de 10 caracteres.');
      expect(control?.valid).toBeTruthy();
    });

    it('debería validar rangos del formulario de artículos', () => {
      const cantidadCtrl = component.articuloForm.get('cantidadIngresada');
      
      cantidadCtrl?.setValue(0); // Mínimo es 1
      expect(cantidadCtrl?.valid).toBeFalsy();

      cantidadCtrl?.setValue(10);
      expect(cantidadCtrl?.valid).toBeTruthy();
    });
  });

  // --- Pruebas de Lógica de la Lista de Artículos ---
  describe('Gestión de Lista Temporal de Artículos', () => {
    it('no debería agregar un producto si el formulario de artículos es inválido', () => {
      component.articuloForm.patchValue({ idProductoSeleccionado: '', cantidadIngresada: 0 });
      component.agregarProductoALista();
      expect(component.detallesPedido.length).toBe(0);
    });

    it('debería agregar un artículo exitosamente a la lista y limpiar el subformulario', () => {
      const prodSeleccionado = mockProductos[0];
      component.articuloForm.patchValue({
        idProductoSeleccionado: JSON.stringify(prodSeleccionado),
        cantidadIngresada: 3,
        observacionIndividual: 'Urgente'
      });

      component.agregarProductoALista();

      expect(component.detallesPedido.length).toBe(1);
      expect(component.detallesPedido[0]).toEqual({
        idProducto: 101,
        nombreProducto: 'Lapicero Azul',
        unidadMedida: 'UNIDAD',
        cantidad: 3,
        observacionEspecifica: 'Urgente'
      });

      // Valores reseteados por defecto
      expect(component.articuloForm.get('idProductoSeleccionado')?.value).toBe('');
      expect(component.articuloForm.get('cantidadIngresada')?.value).toBe(1);
    });

    it('debería rechazar productos duplicados en la lista temporal', () => {
      const prodSeleccionado = mockProductos[0];
      component.articuloForm.patchValue({ idProductoSeleccionado: JSON.stringify(prodSeleccionado), cantidadIngresada: 1 });
      component.agregarProductoALista();

      // Intentar agregar otra vez el mismo
      component.articuloForm.patchValue({ idProductoSeleccionado: JSON.stringify(prodSeleccionado), cantidadIngresada: 5 });
      component.agregarProductoALista();

      expect(component.detallesPedido.length).toBe(1); // Mantiene solo 1
      expect(component.articuloForm.get('idProductoSeleccionado')?.hasError('yaAñadido')).toBeTruthy();
      expect(window.alert).toHaveBeenCalledWith('Este artículo ya ha sido añadido a la lista actual.');
    });

    it('debería regular la cantidad en caliente si el input recibe valores menores a 1', () => {
      component.detallesPedido = [
        { idProducto: 101, nombreProducto: 'Lapicero Azul', unidadMedida: 'UNIDAD', cantidad: 4, observacionEspecifica: '' }
      ];

      const dummyEvent = { target: { value: '0' } } as unknown as Event;
      component.onCantidadInput(dummyEvent, 0);
      expect(component.detallesPedido[0].cantidad).toBe(1);

      const validEvent = { target: { value: '12' } } as unknown as Event;
      component.onCantidadInput(validEvent, 0);
      expect(component.detallesPedido[0].cantidad).toBe(12);
    });

    it('debería eliminar un ítem de la lista por su respectivo índice', () => {
      component.detallesPedido = [
        { idProducto: 101, nombreProducto: 'Lapicero Azul', unidadMedida: 'UNIDAD', cantidad: 2, observacionEspecifica: '' },
        { idProducto: 102, nombreProducto: 'Cuaderno A4', unidadMedida: 'UNIDAD', cantidad: 5, observacionEspecifica: '' }
      ];

      component.eliminarProductoDeLista(0);
      expect(component.detallesPedido.length).toBe(1);
      expect(component.detallesPedido[0].idProducto).toBe(102);
    });
  });

  // --- Pruebas de Operaciones del Backend (Guardar) ---
  describe('Envío del Pedido Completo', () => {
    it('no debería proceder a guardar si el formulario principal es inválido', () => {
      component.pedidoForm.patchValue({ descripcionGeneral: '' }); // Inválido
      component.guardarPedidoCompleto();
      expect(pedidoServiceMock.crearPedido).not.toHaveBeenCalled();
    });

    it('no debería proceder a guardar si la lista temporal de artículos está vacía', () => {
      component.pedidoForm.patchValue({ descripcionGeneral: 'Justificación correcta con más de diez caracteres' });
      component.detallesPedido = []; // Vacío
      component.guardarPedidoCompleto();
      expect(pedidoServiceMock.crearPedido).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('La solicitud debe contener al menos un artículo en la lista.');
    });

    it('debería mapear el DTO de envío y despachar la solicitud de creación con éxito', () => {
      component.pedidoForm.patchValue({ descripcionGeneral: 'Solicitud de insumos para la oficina de sistemas' });
      component.detallesPedido = [
        { idProducto: 102, nombreProducto: 'Cuaderno A4', unidadMedida: 'UNIDAD', cantidad: 10, observacionEspecifica: 'Cuadriculados' }
      ];

      component.guardarPedidoCompleto();

      expect(pedidoServiceMock.crearPedido).toHaveBeenCalledWith({
        descripcion: 'Solicitud de insumos para la oficina de sistemas',
        detalles: [
          { idProducto: 102, cantidad: 10, observacionEspecifica: 'Cuadriculados' }
        ]
      });
      expect(window.alert).toHaveBeenCalledWith('Pedido enviado a procesamiento de abastecimiento correctamente.');
      expect(component.vistaActiva).toBe('historial');
    });

    it('debería manejar errores de respuesta del servidor de manera controlada', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      pedidoServiceMock.crearPedido.mockReturnValueOnce(throwError(() => new Error('Error HTTP 500')));

      component.pedidoForm.patchValue({ descripcionGeneral: 'Solicitud de insumos válida para pruebas' });
      component.detallesPedido = [
        { idProducto: 101, nombreProducto: 'Lapicero Azul', unidadMedida: 'UNIDAD', cantidad: 2, observacionEspecifica: '' }
      ];

      component.guardarPedidoCompleto();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('No se pudo registrar el pedido en el servidor.');
    });
  });
});