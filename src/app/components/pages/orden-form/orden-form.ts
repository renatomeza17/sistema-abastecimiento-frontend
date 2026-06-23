import { Component, OnInit } from '@angular/core';
import { OrdencompraService } from '../../../services/ordencompra.service';
import { ProformaService } from '../../../services/proforma.service';
import { Router, RouterModule } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RequerimientoService } from '../../../services/requerimiento.service';
import { DetalleProformaResponseDTO, ProformaResponseDTO, RequerimientoResponseDTO } from '../../../api/response/requerimiento-response';
import { proveedorResponseDTO } from '../../../api/response/proveedorResponseDTO';
import { OrdenFormModel } from '../../../models/ordenFormModel';
import { OrdenRequestDTO } from '../../../api/request/ordenRequestDTO';

@Component({
  selector: 'app-orden-form',
  imports: [CommonModule, FormsModule, RouterModule,ReactiveFormsModule],
  templateUrl: './orden-form.html',
  styleUrl: './orden-form.scss',
})
export class OrdenForm implements OnInit {// Estructura limpia para enviar al DTO de Spring Boot
 // Estructura limpia para enviar al DTO de Spring Boot (@RequestBody)
  ordenRequest: OrdenFormModel = {
    nroOrden: 'AUTOGENERADO', 
    fechaEmision: new Date().toISOString().substring(0, 10), 
    fechaEntrega: '',                                                                                                                                              
    idRequerimiento: null,
    idProforma: null,
    formaPago: '',
    plazoEntrega: '',
    garantia: '',
    lugarEntrega: '',
    observaciones: ''
  };

  // Arreglos dinámicos reales de la Base de Datos (Neon)
  requerimientosList: RequerimientoResponseDTO[] = [];
  proformaList: ProformaResponseDTO[] = [];

  // Objetos reactivos para renderizar dinámicamente en las tarjetas de Bootstrap
  proveedorSeleccionado: proveedorResponseDTO | null = null;
  items: any[] = [];

  // Totales calculados en tiempo real
  subtotal: number = 0;
  igv: number = 0;
  total: number = 0;


  ordenForm: FormGroup;

  constructor(
    private ordenService: OrdencompraService,
    private requerimientoService: RequerimientoService, 
    private proformaService: ProformaService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.ordenForm = this.fb.group({
    fechaEntrega: ['', [Validators.required, this.validarFechaEntrega.bind(this)]],
    formaPago: ['', Validators.required],
    idRequerimiento: [null, Validators.required],
    idProforma: [null, Validators.required],
    lugarEntrega: ['', Validators.required],
    // RUC del proveedor (si el DTO lo permite, agrégalo para validar)
    // rucProveedor: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
    plazoEntrega: ['',[Validators.required]],
    garantia: ['',[Validators.required]], 
    observaciones: ['']
  });
  }


validarFechaEntrega(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null; // Si está vacío, actúa el 'required'

  // 1. Obtener los textos en formato 'YYYY-MM-DD' de ambos lados
  const fechaEntregaTxt = control.value; // Ej: '2026-06-20'
  const fechaEmisionTxt = this.ordenRequest.fechaEmision; // Ej: '2026-06-22'

  // 2. Convertirlas a milisegundos puros usando Date.parse para evitar problemas de zona horaria (GMT)
  const msEntrega = Date.parse(fechaEntregaTxt);
  const msEmision = Date.parse(fechaEmisionTxt);

  // 3. Evaluar la regla de negocio real: si la entrega es ANTERIOR a la emisión
  if (msEntrega < msEmision) {
    return { fechaInvalida: true }; // Se activa el error para el HTML
  }

  return null; // Todo está correcto
}



  
  ngOnInit(): void {
    this.cargarRequerimientosIniciales();
  }

  // PASO 1: CARGA LOS REQUERIMIENTOS DESDE LA BASE DE DATOS AL INICIAR
  cargarRequerimientosIniciales(): void {
    this.requerimientoService.listarRequerimientosAprobados().subscribe({
      next: (data: RequerimientoResponseDTO[]) => {
        this.requerimientosList = data;
        console.log('Requerimientos reales cargados de Neon:', data);
      },
      error: (err) => console.error('Error al traer requerimientos:', err)
    });
  }


  // PASO 2: SE EJECUTA AL CAMBIAR EL REQUERIMIENTO (Filtra las proformas relacionadas)
  onRequerimientoChange(): void {
    const idReq = this.ordenForm.get('idRequerimiento')?.value;
    
    // Limpiar proformas anteriores y el detalle
    this.ordenForm.get('idProforma')?.setValue(null);
    this.proformaList = [];
    this.limpiarDatosDinamicos();

    if (idReq) {
        this.proformaService.listarPorRequerimiento(idReq).subscribe({
            next: (data: ProformaResponseDTO[]) => {
                this.proformaList = data; // Aquí cargas las proformas específicas de ese requerimiento
            },
            error: (err) => console.error('Error al cargar proformas:', err)
        });
    }
  }



  //  Se activa al seleccionar la proforma en el HTML
  onProformaChange(): void {
    const idProformaSeleccionada = this.ordenForm.get('idProforma')?.value;
    console.log('ID de proforma seleccionado para consultar en Neon:', idProformaSeleccionada);
  
    if (!idProformaSeleccionada) {
      this.limpiarDatosDinamicos();
      return;
    }

    // Llamamos a tu servicio mapeado a /api/proformas/{id}
    this.proformaService.consultarPorId(idProformaSeleccionada).subscribe({
      next: (data: ProformaResponseDTO) => {
        console.log('JSON bruto que llegó del Backend:', data);
        
        
        this.proveedorSeleccionado= data.proveedor || data;
        this.ordenForm.get('plazoEntrega')?.setValue(data.plazoEntrega || '15 días hábiles');
        this.ordenForm.get('garantia')?.setValue(data.garantia || '12 meses');



        // MApEO FLEXIBLE DE PRODUCTOS:
        
        const listaDetallesRaw:DetalleProformaResponseDTO[] = data.productos ||  [];
        console.log('Colección de ítems detectada para procesar:', listaDetallesRaw);

        this.items = listaDetallesRaw.map((item: DetalleProformaResponseDTO, index: number) => {

          return {
            num: index + 1,
            idProducto: item.producto.idProducto ||  null,
            codigo: item.producto.codigo || 'Insumo',
            descripcion: item.producto.nombre || 'Sin descripción técnica',
            unidad: item.producto.unidadMedida || 'Unidad',
            cantidad: item.cantidad || 0,
            precioUnit: item.precioUnitario || 0,
            subtotal: item.subtotal || ((item.cantidad || 0) * (item.precioUnitario || 0))
          };
        });

        console.log('Estructura final inyectada en las tarjetas de Angular:', this.proveedorSeleccionado, this.items);
        this.calcularTotales();
      },
      error: (err) => {
        console.error('Error crítico al solicitar los productos de la proforma:', err);
        this.limpiarDatosDinamicos();
      }
    });
  }




  calcularTotales(): void {
    let GlenSubtotals = 0;
    this.items.forEach(item => {
      GlenSubtotals += item.subtotal;
    });

    this.subtotal = GlenSubtotals;
    this.igv = this.subtotal * 0.18; 
    this.total = this.subtotal + this.igv;
  }




  limpiarDatosDinamicos(): void {
    this.proveedorSeleccionado = null;
    this.items = [];
    this.subtotal = 0;
    this.igv = 0;
    this.total = 0;
  }



  // PASO 4: POSTEA EL PAYLOAD REAL DE MANERA SEGURA AL SERVIDOR
  guardarOrden(): void {
    if(this.ordenForm.invalid){
      this.ordenForm.markAllAsTouched();

      alert('Por favor, completa los campos obligatorios (*) marcados en rojo antes de continuar.');
      return; // Frenamos la función aquí, impidiendo que se dispare el POST

    }
      const formValues = this.ordenForm.value;

      const payloadFinal: OrdenRequestDTO = {
      
        idProforma: Number(formValues.idProforma),
        formaPago: formValues.formaPago,
        fechaEntrega: formValues.fechaEntrega,
        lugarEntrega: formValues.lugarEntrega,
        observaciones: formValues.observaciones,
        plazoEntrega: formValues.plazoEntrega,
        garantia: formValues.garantia

      };

      console.log('Payload JSON final y real enviado a Spring Boot:', payloadFinal);

      this.ordenService.crearOrden(payloadFinal).subscribe({
        next: (response) => {
          console.log('Orden guardada exitosamente en Neon:', response);
          alert('¡Orden de Compra generada de forma exitosa en el sistema SUDAB!');
          this.router.navigate(['/compras/lista']); 
        },
        error: (err) => {
          console.error('Fallo en la inserción HTTP POST:', err);
          alert('Error al guardar en la base de datos. Revisa la terminal de Spring Boot.');
        }
      });


    
    
  }




  cancelar(): void {
    this.router.navigate(['/compras/lista']);
  }


}