import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { KardexNuevo } from './kardex-nuevo';
import { KardexService } from '../../../services/kardex.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

// --- Mock del servicio ---
const kardexServiceMock = {
  obtenerProductosDisponibles: vi.fn(),
  crearNuevoAsiento: vi.fn(),
};

describe('KardexNuevo', () => {
  let component: KardexNuevo;
  let fixture: ComponentFixture<KardexNuevo>;

  beforeEach(async () => {
    kardexServiceMock.obtenerProductosDisponibles.mockReturnValue(
      of([
        { idProducto: 1, codigo: 'UTI-001', nombre: 'Papel Bond A4' },
        { idProducto: 2, codigo: 'UTI-002', nombre: 'Lapicero Azul' },
      ])
    );

    await TestBed.configureTestingModule({
      imports: [KardexNuevo, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: KardexService, useValue: kardexServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KardexNuevo);
    component = fixture.componentInstance;
    fixture.detectChanges(); // dispara ngOnInit
  });

  // ─── 1. Creación del componente ───────────────────────────────────────────
  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // ─── 2. Formulario inicial inválido ──────────────────────────────────────
  it('el formulario debe ser inválido al inicio', () => {
    expect(component.kardexForm.valid).toBe(false);
  });

  // ─── 3. Carga de productos al inicializar ────────────────────────────────
  it('debe cargar el catálogo de productos en ngOnInit', () => {
    expect(component.productosDisponibles.length).toBe(2);
    expect(component.productosDisponibles[0].codigo).toBe('UTI-001');
  });

  // ─── 4. Selección de producto actualiza productoSeleccionado ─────────────
  it('onProductoChange debe asignar productoSeleccionado correctamente', () => {
    component.kardexForm.get('idProducto')?.setValue(1);
    component.onProductoChange();
    expect(component.productoSeleccionado?.nombre).toBe('Papel Bond A4');
  });

  // ─── 5. Validación del patrón de ubicación ───────────────────────────────
  it('ubicacionAlmacen debe rechazar formato incorrecto', () => {
    const control = component.kardexForm.get('ubicacionAlmacen');
    control?.setValue('Zona A - Estante 02');   // formato largo, no válido
    control?.markAsTouched();
    expect(control?.errors?.['pattern']).toBeTruthy();
  });

  it('ubicacionAlmacen debe aceptar formato correcto (A-02-03)', () => {
    const control = component.kardexForm.get('ubicacionAlmacen');
    control?.setValue('A-02-03');
    expect(control?.valid).toBe(true);
  });

  // ─── 6. stockMinimo con valor menor a 1 es inválido ──────────────────────
  it('stockMinimo debe ser inválido si el valor es 0', () => {
    const control = component.kardexForm.get('stockMinimo');
    control?.setValue(0);
    control?.markAsTouched();
    expect(control?.errors?.['min']).toBeTruthy();
  });

  // ─── 7. Formulario válido con todos los campos correctos ─────────────────
  it('el formulario debe ser válido con todos los campos correctos', () => {
    component.kardexForm.setValue({
      idProducto: 1,
      unidadMedida: 'UNIDAD',
      categoria: 'Útiles de Escritorio',
      subcategoria: 'Papelería',
      stockMinimo: 10,
      ubicacionAlmacen: 'A-02-03',
      caracteristicas: 'Prueba',
    });
    expect(component.kardexForm.valid).toBe(true);
  });

  // ─── 8. guardarFichaTecnica no llama al servicio si el form es inválido ──
  it('guardarFichaTecnica no debe llamar al servicio si el formulario es inválido', () => {
    component.guardarFichaTecnica();
    expect(kardexServiceMock.crearNuevoAsiento).not.toHaveBeenCalled();
    expect(component.mensajeError).toBeTruthy();
  });

  // ─── 9. Flujo exitoso de guardado ────────────────────────────────────────
  it('guardarFichaTecnica debe llamar al servicio y mostrar mensaje de éxito', () => {
    // Llenar formulario válido
    component.kardexForm.setValue({
      idProducto: 1,
      unidadMedida: 'UNIDAD',
      categoria: 'Útiles de Escritorio',
      subcategoria: 'Papelería',
      stockMinimo: 5,
      ubicacionAlmacen: 'B-01-02',
      caracteristicas: '',
    });

    kardexServiceMock.crearNuevoAsiento.mockReturnValue(of({ id: 99 }));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.guardarFichaTecnica();

    expect(kardexServiceMock.crearNuevoAsiento).toHaveBeenCalled();
    expect(component.mensajeExito).toBeTruthy();
    expect(component.mensajeError).toBe('');
  });

  // ─── 10. Manejo de error del servicio ────────────────────────────────────
  it('guardarFichaTecnica debe mostrar mensajeError si el servicio falla', () => {
    component.kardexForm.setValue({
      idProducto: 1,
      unidadMedida: 'UNIDAD',
      categoria: 'Útiles de Escritorio',
      subcategoria: 'Papelería',
      stockMinimo: 5,
      ubicacionAlmacen: 'B-01-02',
      caracteristicas: '',
    });

    kardexServiceMock.crearNuevoAsiento.mockReturnValue(
      throwError(() => new Error('500'))
    );
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.guardarFichaTecnica();

    expect(component.mensajeError).toBeTruthy();
    expect(component.mensajeExito).toBe('');
  });
});