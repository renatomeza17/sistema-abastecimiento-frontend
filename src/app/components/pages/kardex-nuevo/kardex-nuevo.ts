import { Component, OnInit } from '@angular/core';
import { Producto } from '../../../models/Producto';
import { KardexRequestDTO } from '../../../api/request/kardexRequestDTO';
import { KardexService } from '../../../services/kardex.service';
import { CommonModule } from '@angular/common'; // <-- 1. IMPORTANTE: Trae *ngIf, *ngFor, etc.
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
// import { form } from '@angular/forms/signals';


@Component({
  selector: 'app-kardex-nuevo',
  imports: [CommonModule, RouterModule,ReactiveFormsModule],
  templateUrl: './kardex-nuevo.html',
  styleUrl: './kardex-nuevo.scss'
})


export class KardexNuevo implements OnInit {
 

  kardexForm!: FormGroup;
  productosDisponibles: any[] = [];
  productoSeleccionado: any | null = null;
  mensajeExito: string = '';
  mensajeError: string = '';

  constructor(
    private fb: FormBuilder,
    private kardexService: KardexService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarCatalogoMaestro();
  }


  initForm(): void {
    this.kardexForm = this.fb.group({
      idProducto: [null, [Validators.required]],
      unidadMedida: ['', [Validators.required]],
      categoria: ['', [Validators.required]],
      subcategoria: ['', [Validators.required]],
      // Validación numérica estricta: obligatorio y mínimo valor 1
      stockMinimo: [null, [Validators.required, Validators.min(1)]],
      // Patrón estructurado Regex de almacén
      ubicacionAlmacen: ['', [Validators.required, Validators.pattern('^[A-Z]-[0-9]{2}-[0-9]{2}$')]],
      caracteristicas: ['']
    });
  }

  cargarCatalogoMaestro(): void {
    this.kardexService.obtenerProductosDisponibles()
      .subscribe({
        next: (data: any[]) => {
          this.productosDisponibles = data;
        },
        error: (err: any) => {
          console.error('Fallo de comunicación asíncrona:', err);
          this.mensajeError = 'Error de conexión: No se pudieron cargar los productos del catálogo.';
        }
      });
  }

  // Intercepta el cambio de producto para capturar código y nombre en caliente
  onProductoChange(): void {
    const idProductoSeleccionado = this.kardexForm.get('idProducto')?.value;
    if (idProductoSeleccionado) {
      this.productoSeleccionado = this.productosDisponibles.find(
        (p: any) => p.idProducto == idProductoSeleccionado
      );
    } else {
      this.productoSeleccionado = null;
    }
  }

  guardarFichaTecnica(): void {
    if (this.kardexForm.invalid) {
      this.kardexForm.markAllAsTouched();
      this.mensajeError = 'Por favor, resuelva las alertas rojas del formulario antes de persistir en el sistema.';
      return;
    }
    
    

    const confirmacion = window.confirm('¿Está seguro de aperturar la ficha técnica de Kárdex para este producto?');

    // Si el usuario hace clic en "Cancelar", detenemos la ejecución aquí
    if (!confirmacion) {
      return; 
    }

    const payloadFinal = this.kardexForm.value;
    console.log('Payload Reactivo enviado a Spring Boot:', payloadFinal);
    
  
    this.kardexService.crearNuevoAsiento(payloadFinal)
      .subscribe({
        next: (res: any) => {
          // 2. Si Angular logra leer la respuesta perfectamente, lanza esta alerta:
          alert('✅ ¡ÉXITO! La Ficha Técnica ha sido guardada en la base de datos correctamente.');

          this.mensajeExito = '¡Ficha Técnica de Control aperturada con éxito!';
          this.mensajeError = '';
          window.scrollTo({ top: 0, behavior: 'smooth' });

          this.kardexForm.reset();
          this.productoSeleccionado = null;
          this.cargarCatalogoMaestro(); // Refresca el combo para actualizar la UI
          
          setTimeout(() => {
            this.router.navigate(['inventario/nuevo-kardex']);
          }, 5000);
        },
        error: (err: any) => {
          console.error('Fallo al registrar en Neon:', err);
          
          this.mensajeError = 'No se pudo registrar la ficha técnica en el servidor.';
          this.mensajeExito = '';
        }
      });
  }


  // limpiarFormulario(): void {
  //   this.kardexRequest = {
  //     idProducto: null,
  //     unidadMedida: '',
  //     categoria: '',
  //     subcategoria: '',
  //     stockMinimo: null,
  //     ubicacionAlmacen: '',
  //     caracteristicas: ''
  //   };
  //   this.productoSeleccionado = null;
  // }

}
