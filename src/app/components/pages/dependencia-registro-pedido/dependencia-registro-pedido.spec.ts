import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DependenciaRegistroPedidoComponent } from './dependencia-registro-pedido';
import { PedidoService } from '../../../services/pedido.service';
import { ProductoService } from '../../../services/producto.service';
import { PedidoResponseDTO } from '../../../api/response/pedido-responseDTO';
import { productoResponseDTO } from '../../../api/response/productoResponseDTO';

describe('DependenciaRegistroPedidoComponent', () => {
  let component: DependenciaRegistroPedidoComponent;
  let fixture: ComponentFixture<DependenciaRegistroPedidoComponent>;
  
  let pedidoServiceMock: any;
  let productoServiceMock: any;

  // 1. Corregido: fechaCreacion cambiado a string ISO
// Corregido: Se agregaron las propiedades idPedido y nombreSolicitante exigidas por la interfaz
  const mockHistorial: PedidoResponseDTO[] = [
  { 
    idPedido: 1, // 👈 Agregado (usa el tipo que corresponda, sea number o string)
    codigo: 'PED-001', 
    descripcion: 'Pedido de prueba 1', 
    fechaCreacion: new Date().toISOString(), 
    estado: 'PENDIENTE', 
    nombreSolicitante: 'Mitchell Sihuincha', // 👈 Agregado
    detalles: [] 
  }
];
  // 2. Corregido: Se añadieron las propiedades faltantes exigidas por productoResponseDTO
  const mockCatalogo: productoResponseDTO[] = [
    { idProducto: 1, codigo: 'PROD-01', nombre: 'Papel Bond A4', descripcion: 'Papel bond de 80g', unidadMedida: 'Millar', activo: true },
    { idProducto: 2, codigo: 'PROD-02', nombre: 'Lapicero Azul', descripcion: 'Lapicero punta fina', unidadMedida: 'Caja', activo: true }
  ];

  beforeEach(async () => {
    pedidoServiceMock = {
      listarMisPedidos: vi.fn().mockReturnValue(of(mockHistorial)),
      crearPedido: vi.fn().mockReturnValue(of({}))
    };

    productoServiceMock = {
      obtenerCatalogoProductos: vi.fn().mockReturnValue(of(mockCatalogo))
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        NgbTooltipModule,
        DependenciaRegistroPedidoComponent 
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

  it('1. Debe inicializar correctamente los formularios y cargar el catálogo/historial', () => {
    expect(component).toBeTruthy();
    expect(component.pedidoForm).toBeDefined();
    expect(component.articuloForm).toBeDefined();
    expect(component.pedidosHistorial.length).toBe(1);
    expect(component.productosCatalogo.length).toBe(2);
  });

  describe('Validaciones del Input 1: cantidadIngresada (Formulario Agregador)', () => {
    it('Debe ser válido con un número entero positivo común', () => {
      const control = component.articuloForm.get('cantidadIngresada');
      control?.setValue(5);
      expect(control?.valid).toBe(true);
    });

    it('Debe marcar error si el campo se deja vacío', () => {
      const control = component.articuloForm.get('cantidadIngresada');
      control?.setValue(null);
      expect(control?.hasError('required')).toBe(true);
    });

    it('Debe invalidar si el número es cero o negativo', () => {
      const control = component.articuloForm.get('cantidadIngresada');
      control?.setValue(0);
      expect(control?.hasError('pattern')).toBe(true);

      control?.setValue(-5);
      expect(control?.hasError('pattern')).toBe(true);
    });

    it('Debe invalidar si se ingresa un número decimal', () => {
      const control = component.articuloForm.get('cantidadIngresada');
      control?.setValue(12.5);
      expect(control?.hasError('pattern')).toBe(true);
    });

    it('Debe invalidar si el valor supera el límite establecido de 100 unidades', () => {
      const control = component.articuloForm.get('cantidadIngresada');
      control?.setValue(101);
      expect(control?.hasError('max')).toBe(true);
    });
  });

  describe('Pruebas del Interceptor de Teclado', () => {
    it('Debe prevenir la ejecución del evento (preventDefault) ante caracteres inválidos', () => {
      const eventoPunto = { key: '.', preventDefault: vi.fn() } as unknown as KeyboardEvent;
      const eventoLetraE = { key: 'e', preventDefault: vi.fn() } as unknown as KeyboardEvent;
      const eventoMenos = { key: '-', preventDefault: vi.fn() } as unknown as KeyboardEvent;

      component.bloquearTeclasInvalidas(eventoPunto);
      component.bloquearTeclasInvalidas(eventoLetraE);
      component.bloquearTeclasInvalidas(eventoMenos);

      expect(eventoPunto.preventDefault).toHaveBeenCalled();
      expect(eventoLetraE.preventDefault).toHaveBeenCalled();
      expect(eventoMenos.preventDefault).toHaveBeenCalled();
    });

    it('Debe permitir la propagación normal si es un número válido', () => {
      const eventoNumero = { key: '5', preventDefault: vi.fn() } as unknown as KeyboardEvent;
      component.bloquearTeclasInvalidas(eventoNumero);
      expect(eventoNumero.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Lógica de manipulación de la Lista de Elementos', () => {
    it('Debe añadir un producto correctamente si pasa todas las validaciones', () => {
      component.articuloForm.get('idProductoSeleccionado')?.setValue(mockCatalogo[0]);
      component.articuloForm.get('cantidadIngresada')?.setValue(10);
      component.articuloForm.get('observacionIndividual')?.setValue('Cajas selladas');

      component.agregarProductoALista();

      expect(component.detallesPedido.length).toBe(1);
      expect(component.detallesPedido[0].nombreProducto).toBe('Papel Bond A4');
      expect(component.articuloForm.get('cantidadIngresada')?.value).toBe(1);
    });

    it('Debe impedir la inserción y alertar si el producto ya está en la lista', () => {
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      // 3. Corregido: Se añade observacionEspecifica exigida por ItemFilaPedido
      component.detallesPedido = [{ idProducto: 1, nombreProducto: 'Papel Bond A4', unidadMedida: 'Millar', cantidad: 5, observacionEspecifica: '' }];

      component.articuloForm.get('idProductoSeleccionado')?.setValue(mockCatalogo[0]); 
      component.articuloForm.get('cantidadIngresada')?.setValue(2);
      
      component.agregarProductoALista();

      expect(component.detallesPedido.length).toBe(1); 
      expect(window.alert).toHaveBeenCalledWith('Este artículo ya ha sido añadido a la lista actual.');
    });

    it('Debe remover un elemento basado en su índice', () => {
      // 3. Corregido: Se añade observacionEspecifica exigida por ItemFilaPedido
      component.detallesPedido = [
        { idProducto: 1, nombreProducto: 'Prod A', unidadMedida: 'Und', cantidad: 5, observacionEspecifica: '' },
        { idProducto: 2, nombreProducto: 'Prod B', unidadMedida: 'Und', cantidad: 10, observacionEspecifica: '' }
      ];

      component.eliminarProductoDeLista(0);

      expect(component.detallesPedido.length).toBe(1);
      expect(component.detallesPedido[0].nombreProducto).toBe('Prod B');
    });
  });

  describe('Validación del Input 2: Control antes de Guardar el Pedido Completo', () => {
    beforeEach(() => {
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      component.pedidoForm.get('descripcionGeneral')?.setValue('Justificación válida de más de 10 letras');
    });

    it('Debe rechazar el envío si un artículo en la grilla fue alterado manualmente a un valor decimal', () => {
      // 3. Corregido: Se añade observacionEspecifica exigida por ItemFilaPedido
      component.detallesPedido = [
        { idProducto: 1, nombreProducto: 'Papel Bond A4', unidadMedida: 'Millar', cantidad: 5.5, observacionEspecifica: '' } 
      ];

      component.guardarPedidoCompleto();

      expect(pedidoServiceMock.crearPedido).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Error en el ítem N° 1 (Papel Bond A4): Solo se aceptan números enteros entre 1 y 100.');
    });

    it('Debe rechazar el envío si la cantidad de la grilla supera las 100 unidades', () => {
      // 3. Corregido: Se añade observacionEspecifica exigida por ItemFilaPedido
      component.detallesPedido = [
        { idProducto: 1, nombreProducto: 'Papel Bond A4', unidadMedida: 'Millar', cantidad: 150, observacionEspecifica: '' } 
      ];

      component.guardarPedidoCompleto();

      expect(pedidoServiceMock.crearPedido).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Error en el ítem N° 1 (Papel Bond A4): Solo se aceptan números enteros entre 1 y 100.');
    });

    it('Debe procesar el envío (HTTP POST) si todos los elementos de la grilla son enteros válidos', () => {
      // 3. Corregido: Se añade observacionEspecifica exigida por ItemFilaPedido
      component.detallesPedido = [
        { idProducto: 1, nombreProducto: 'Papel Bond A4', unidadMedida: 'Millar', cantidad: 10, observacionEspecifica: '' },
        { idProducto: 2, nombreProducto: 'Lapicero Azul', unidadMedida: 'Caja', cantidad: 99, observacionEspecifica: '' }
      ];

      component.guardarPedidoCompleto();

      expect(pedidoServiceMock.crearPedido).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Pedido enviado a procesamiento de abastecimiento correctamente.');
    });
  });

  describe('Gestión de Excepciones del Servidor', () => {
    it('Debe manejar adecuadamente un error 500 o de red desde el backend', () => {
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
      
      pedidoServiceMock.crearPedido.mockReturnValue(throwError(() => new Error('Internal Server Error')));
      
      component.pedidoForm.get('descripcionGeneral')?.setValue('Solicitud de útiles mensual de contingencia');
      // 3. Corregido: Se añade observacionEspecifica exigida por ItemFilaPedido
      component.detallesPedido = [{ idProducto: 1, nombreProducto: 'Item', unidadMedida: 'Und', cantidad: 5, observacionEspecifica: '' }];

      component.guardarPedidoCompleto();

      expect(window.alert).toHaveBeenCalledWith('No se pudo registrar el pedido en el servidor.');
      expect(console.error).toHaveBeenCalled();
    });
  });
});