import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { RequerimientoService } from '../../../services/requerimiento.service';
import { AuthService } from '../../../services/auth.service';
import { RequerimientoRequestDTO } from '../../../api/request/requerimiento-request';
import { RequerimientoResponseDTO } from '../../../api/response/requerimiento-response';
import { productoResponseDTO } from '../../../api/response/productoResponseDTO';

@Component({
  selector: 'app-requerimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-requerimientos.html',
  styleUrls: ['./lista-requerimientos.scss']
})
export class RequerimientosComponent implements OnInit {

  vistaActiva: 'lista' | 'nuevo' = 'lista';

  listaRequerimientos: RequerimientoResponseDTO[] = [];
  catalogoProductos: productoResponseDTO[] = [];

  /*
   * TODO: MEJORAR
   * Actualmente las dependencias están hardcodeadas.
   *
   * Futuro:
   * 1. Crear tabla DEPENDENCIA.
   * 2. Crear entidad Dependencia.
   * 3. Crear endpoint REST.
   * 4. Consumir dependencias dinámicamente desde Angular.
   * 5. Agregar idDependencia al RequerimientoRequestDTO.
   */
  listaDependencias = [
    'Facultad de Medicina',
    'Facultad de Derecho y Ciencia Política',
    'Facultad de Ingeniería de Sistemas e Informática',
    'Facultad de Ciencias Matemáticas',
    'Facultad de Ciencias Físicas',
    'Facultad de Ciencias Biológicas',
    'Facultad de Ciencias Contables',
    'Facultad de Ciencias Económicas',
    'Facultad de Ciencias Administrativas',
    'Facultad de Farmacia y Bioquímica',
    'Facultad de Ingeniería Industrial',
    'Facultad de Ingeniería Electrónica y Eléctrica',
    'Facultad de Ingeniería Geológica, Minera, Metalúrgica y Geográfica',
    'Facultad de Ingeniería Química y Textil',
    'Facultad de Letras y Ciencias Humanas',
    'Facultad de Educación',
    'Facultad de Psicología',
    'Facultad de Ciencias Sociales',
    'Facultad de Odontología',
    'Facultad de Medicina Veterinaria'
  ];

  descripcionNueva = '';
  dependenciaSeleccionada = '';

  productosSeleccionados: {
    idProducto: number;
    nombre: string;
    cantidad: number;
    unidadMedida?: string;
    codigo?: string;
  }[] = [];

  productoSeleccionadoInput: productoResponseDTO | null = null;
  cantidadInput: number | null = null;

  cargando = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(
    private requerimientoService: RequerimientoService,
    private prodService: ProductoService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarRequerimientos();
    this.cargarCatalogo();
  }

  cargarRequerimientos(): void {
    this.cargando = true;

    this.requerimientoService.listar().subscribe({
      next: (data) => {
        this.listaRequerimientos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  cargarCatalogo(): void {
    this.prodService.obtenerCatalogoProductos().subscribe({
      next: (data) => this.catalogoProductos = data,
      error: (err) => console.error(err)
    });
  }

  agregarProducto(): void {

    this.mensajeError = '';

    if (!this.productoSeleccionadoInput || !this.cantidadInput || this.cantidadInput <= 0) {
      this.mensajeError = 'Seleccione un producto y una cantidad válida.';
      return;
    }

    const yaExiste = this.productosSeleccionados.find(
      p => p.idProducto === this.productoSeleccionadoInput?.idProducto
    );

    if (yaExiste) {
      this.mensajeError = 'Ese producto ya fue agregado.';
      return;
    }

    this.productosSeleccionados.push({
      idProducto: this.productoSeleccionadoInput.idProducto,
      nombre: this.productoSeleccionadoInput.nombre,
      cantidad: this.cantidadInput,
      codigo: this.productoSeleccionadoInput.codigo,
      unidadMedida: this.productoSeleccionadoInput.unidadMedida
    });

    this.productoSeleccionadoInput = null;
    this.cantidadInput = null;
  }

  removerProducto(index: number): void {
    this.productosSeleccionados.splice(index, 1);
  }

  guardarRequerimiento(): void {

    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.dependenciaSeleccionada) {
      this.mensajeError = 'Seleccione una dependencia.';
      return;
    }

    if (!this.descripcionNueva.trim()) {
      this.mensajeError = 'La descripción es obligatoria.';
      return;
    }

    if (this.productosSeleccionados.length === 0) {
      this.mensajeError = 'Agregue al menos un producto.';
      return;
    }

    const dto: RequerimientoRequestDTO = {
      descripcion: this.descripcionNueva.trim(),
      detalles: this.productosSeleccionados.map(p => ({
        idProducto: p.idProducto,
        cantidad: p.cantidad
      }))
    };

    this.requerimientoService.crear(dto).subscribe({
      next: (res) => {

        this.mensajeExito = `Requerimiento ${res.codigo} creado exitosamente.`;

        this.descripcionNueva = '';
        this.dependenciaSeleccionada = '';
        this.productosSeleccionados = [];

        this.cargarRequerimientos();

        setTimeout(() => {
          this.vistaActiva = 'lista';
          this.mensajeExito = '';
        }, 1500);
      },
      error: (err) => {
        console.error(err);
        this.mensajeError = 'Error al crear el requerimiento.';
      }
    });
  }

  aprobarRequerimiento(id: number): void {
    if (confirm('¿Aprobar este requerimiento?')) {
      this.requerimientoService.cambiarEstado(id, 'APROBADO').subscribe({
        next: () => {
          this.mensajeExito = 'Requerimiento aprobado correctamente.';
          this.cargarRequerimientos();
        },
        error: (err) => {
          console.error(err);
          this.mensajeError = 'Error al aprobar el requerimiento.';
        }
      });
    }
  }

  getEstadoClass(estado: string): string {

    const map: { [k: string]: string } = {
      PENDIENTE: 'badge-pendiente',
      EN_PROCESO: 'badge-proceso',
      APROBADO: 'badge-aprobado',
      CANCELADO: 'badge-cancelado'
    };

    return map[estado] || 'bg-secondary';
  }
}