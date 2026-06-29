import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { KardexNuevo } from './kardex-nuevo';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { KardexService } from '../../../services/kardex.service';
import { Router, ActivatedRoute } from '@angular/router'; 
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';

describe('KardexNuevo Component', () => {
  let component: KardexNuevo;
  let fixture: ComponentFixture<KardexNuevo>;
  let mockKardexService: any;
  let mockRouter: any;

  const mockProductos = [
    { idProducto: 1, codigo: 'UTI-001', nombre: 'Grampas 26/6' },
    { idProducto: 2, codigo: 'EQP-002', nombre: 'Mouse Óptico USB' }
  ];

  beforeAll(() => {
    // Previene fallos en entornos virtuales jsdom/happy-dom donde scrollTo no existe
    Object.defineProperty(window, 'scrollTo', {
      writable: true,
      value: vi.fn(),
    });
  });

  beforeEach(async () => {
    // Inicialización de mocks de servicios con Vitest
    mockKardexService = {
      obtenerProductosDisponibles: vi.fn().mockReturnValue(of(mockProductos)),
      crearNuevoAsiento: vi.fn()
    };
    
    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        KardexNuevo // Importado directamente por ser un componente Standalone
      ],
      providers: [
        FormBuilder,
        { provide: KardexService, useValue: mockKardexService },
        { provide: Router, useValue: mockRouter },
        { 
          provide: ActivatedRoute, 
          useValue: {
            snapshot: { paramMap: { get: () => null } },
            params: of({}),
            queryParams: of({})
          } 
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(KardexNuevo);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Ejecuta ngOnInit y carga el catálogo maestro
  });

  it('debería crear el componente e inicializar el catálogo maestro', () => {
    expect(component).toBeTruthy();
    expect(mockKardexService.obtenerProductosDisponibles).toHaveBeenCalled();
    expect(component.productosDisponibles.length).toBe(2);
  });

  // --- PRUEBAS DE VALIDACIÓN DEL FORMULARIO ---
  describe('Validación del Formulario (kardexForm)', () => {
    
    it('debería ser inválido cuando está vacío', () => {
      expect(component.kardexForm.valid).toBe(false);
    });

    it('debería requerir campos obligatorios', () => {
      const idProductoControl = component.kardexForm.get('idProducto');
      const unidadMedidaControl = component.kardexForm.get('unidadMedida');
      
      idProductoControl?.setValue(null);
      unidadMedidaControl?.setValue('');

      expect(idProductoControl?.hasError('required')).toBe(true);
      expect(unidadMedidaControl?.hasError('required')).toBe(true);
    });

    // --- TEST: STOCK MÍNIMO (Reglas Regex de 1 a 100) ---
    describe('Campo: stockMinimo', () => {
      it('debería fallar si es menor que 1 o mayor que 100', () => {
        const stockControl = component.kardexForm.get('stockMinimo');

        stockControl?.setValue(0);
        expect(stockControl?.valid).toBe(false);

        stockControl?.setValue(101);
        expect(stockControl?.hasError('max')).toBe(true);
      });

      it('debería fallar si se ingresan decimales (Filtro Regex)', () => {
        const stockControl = component.kardexForm.get('stockMinimo');
        stockControl?.setValue(15.5);
        expect(stockControl?.hasError('pattern')).toBe(true);
      });

      it('debería ser válido con enteros entre 1 y 100', () => {
        const stockControl = component.kardexForm.get('stockMinimo');
        
        stockControl?.setValue(1);
        expect(stockControl?.valid).toBe(true);

        stockControl?.setValue(50);
        expect(stockControl?.valid).toBe(true);

        stockControl?.setValue(100);
        expect(stockControl?.valid).toBe(true);
      });
    });

    // --- TEST: CARACTERÍSTICAS / DESCRIPCIÓN DETALLADA (Max 200 caracteres) ---
    describe('Campo: caracteristicas', () => {
      it('debería aceptar un texto menor o igual a 200 caracteres', () => {
        const txtControl = component.kardexForm.get('caracteristicas');
        txtControl?.setValue('Condiciones normales de almacenamiento en estanterías frías.');
        expect(txtControl?.valid).toBe(true);
      });

      it('debería fallar si el texto supera los 200 caracteres (Filtro Regex)', () => {
        const txtControl = component.kardexForm.get('caracteristicas');
        const textoLargo = 'a'.repeat(201);
        
        txtControl?.setValue(textoLargo);
        expect(txtControl?.hasError('pattern')).toBe(true);
      });
    });

    // --- TEST: UBICACIÓN ALMACÉN (Formato Regex A-00-00) ---
    describe('Campo: ubicacionAlmacen', () => {
      it('debería fallar si no sigue la nomenclatura estricta del almacén', () => {
        const ubicacionControl = component.kardexForm.get('ubicacionAlmacen');

        ubicacionControl?.setValue('a-11-22'); // Minúscula inválida
        expect(ubicacionControl?.hasError('pattern')).toBe(true);

        ubicacionControl?.setValue('A-1-2'); // Dígitos incompletos
        expect(ubicacionControl?.hasError('pattern')).toBe(true);
      });

      it('debería ser válido si cumple la estructura estructural Regex', () => {
        const ubicacionControl = component.kardexForm.get('ubicacionAlmacen');
        ubicacionControl?.setValue('B-12-04');
        expect(ubicacionControl?.valid).toBe(true);
      });
    });
  });

  // --- PRUEBAS DE MÉTODOS Y COMPORTAMIENTO ---
  describe('Método: onProductoChange', () => {
    it('debería mapear el objeto producto seleccionado cuando cambia el idProducto', () => {
      component.kardexForm.get('idProducto')?.setValue(2);
      component.onProductoChange();

      expect(component.productoSeleccionado).toBeTruthy();
      expect(component.productoSeleccionado.codigo).toBe('EQP-002');
    });

    it('debería resetear el producto seleccionado a null si el id es vacío', () => {
      component.kardexForm.get('idProducto')?.setValue(null);
      component.onProductoChange();

      expect(component.productoSeleccionado).toBeNull();
    });
  });

  describe('Método: guardarFichaTecnica', () => {
    beforeEach(() => {
      // Re-establecemos valores válidos antes de testear flujos de persistencia
      component.kardexForm.setValue({
        idProducto: 1,
        unidadMedida: 'UNIDAD',
        categoria: 'Útiles de Escritorio',
        subcategoria: 'Papelería',
        stockMinimo: 10,
        ubicacionAlmacen: 'A-10-20',
        caracteristicas: 'Prueba completa con Vitest'
      });
    });

    it('no debería proceder si el formulario es inválido', () => {
      component.kardexForm.get('idProducto')?.setValue(null);
      component.guardarFichaTecnica();

      expect(mockKardexService.crearNuevoAsiento).not.toHaveBeenCalled();
      expect(component.mensajeError).toContain('Por favor, resuelva las alertas rojas');
    });

it('debería llamar al servicio y resetear el formulario tras confirmación exitosa', () => {
      vi.useFakeTimers();

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {}); 
      
      mockKardexService.crearNuevoAsiento.mockReturnValue(of({ status: 'CREATED' }));

      // Guardamos una copia exacta de los datos esperados antes de que el componente los limpie
      const datosEsperados = { ...component.kardexForm.value };

      component.guardarFichaTecnica();

      // Comparamos contra la copia estática que guardamos, evitando el problema de la referencia reseteada
      expect(mockKardexService.crearNuevoAsiento).toHaveBeenCalledWith(datosEsperados);
      expect(component.mensajeExito).toContain('aperturada con éxito!');
      
      vi.advanceTimersByTime(5000);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['inventario/nuevo-kardex']);

      confirmSpy.mockRestore();
      alertSpy.mockRestore();
      vi.useRealTimers();
    });

    it('debería capturar el error de comunicación si el backend falla', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      mockKardexService.crearNuevoAsiento.mockReturnValue(throwError(() => new Error('Error de servidor')));

      component.guardarFichaTecnica();

      expect(component.mensajeError).toContain('No se pudo registrar la ficha técnica en el servidor.');
      expect(component.mensajeExito).toBe('');

      confirmSpy.mockRestore();
    });
  });
});