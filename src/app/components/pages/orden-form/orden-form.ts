import { Component, OnInit } from '@angular/core';
import { OrdencompraService } from '../../../services/ordencompra.service';
import { ProformaService } from '../../../services/proforma.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RequerimientoService } from '../../../services/requerimiento.service';
import { DetalleProformaResponseDTO, ProformaResponseDTO, RequerimientoResponseDTO } from '../../../api/response/requerimiento-response';
import { proveedorResponseDTO } from '../../../api/response/proveedorResponseDTO';
import { OrdenFormModel } from '../../../models/ordenFormModel';
import { OrdenRequestDTO } from '../../../api/request/ordenRequestDTO';

@Component({
  selector: 'app-orden-form',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './orden-form.html',
  styleUrl: './orden-form.scss',
})
export class OrdenForm implements OnInit {// Estructura limpia para enviar al DTO de Spring Boot
 // Estructura limpia para enviar al DTO de Spring Boot (@RequestBody)
  ordenRequest: OrdenFormModel = {
    nroOrden: 'OC-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000), // Secuencial dinámico para evitar errores de Unique Constraint
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

  constructor(
    private ordenService: OrdencompraService,
    private requerimientoService: RequerimientoService, 
    private proformaService: ProformaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarRequerimientosIniciales();
  }

  // PASO 1: CARGA LOS REQUERIMIENTOS DESDE LA BASE DE DATOS AL INICIAR
  cargarRequerimientosIniciales(): void {
    this.proformaService.listarRequerimientosAprobados().subscribe({
      next: (data: RequerimientoResponseDTO[]) => {
        this.requerimientosList = data;
        console.log('Requerimientos reales cargados de Neon:', data);
      },
      error: (err) => console.error('Error al traer requerimientos:', err)
    });
  }

  // PASO 2: SE EJECUTA AL CAMBIAR EL REQUERIMIENTO (Filtra las proformas relacionadas)
  onRequerimientoChange(): void {
    const idReq = this.ordenRequest.idRequerimiento;
    
    // Limpiar proformas anteriores y el detalle
    this.ordenRequest.idProforma = null;
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



  // 🛠️ PASO 3: ¡MÉTODO RECUPERADO! Se activa al seleccionar la proforma en el HTML
  onProformaChange(): void {
    const idProformaSeleccionada = this.ordenRequest.idProforma;
    console.log('ID de proforma seleccionado para consultar en Neon:', idProformaSeleccionada);
  
    if (!idProformaSeleccionada) {
      this.limpiarDatosDinamicos();
      return;
    }

    // Llamamos a tu servicio mapeado a /api/proformas/{id}
    this.proformaService.consultarPorId(idProformaSeleccionada).subscribe({
      next: (data: ProformaResponseDTO) => {
        console.log('JSON bruto que llegó del Backend:', data);
        
        // 📌 TRUCO DE FLEXIBILIDAD ABSOLUTA:
        // Si tu objeto proveedor viene anidado lo extrae, si viene plano en la raíz también.
        this.proveedorSeleccionado= data.proveedor || data;
        
        // this.proveedorSeleccionado = {
        //   idProveedor: prov.idProveedor || prov.id_proveedor || null,
        //   razonSocial: prov.razonSocialProveedor || prov.razon_social || 'Proveedor Sin Nombre',
        //   ruc: prov.ruc || '00000000000',
        //   direccion: prov.direccion || 'Dirección fiscal no registrada',
        //   contacto: prov.contacto || 'No especificado',
        //   telefono: prov.telefono || 'Sin teléfono'
        // };

        // Inyectamos plazos por defecto si no vienen explícitos en el DTO
        this.ordenRequest.plazoEntrega = data.plazoEntrega || '15 días hábiles';
        this.ordenRequest.garantia = data.garantia || '12 meses';

        // 📌 MApEO FLEXIBLE DE PRODUCTOS:
        // Evalúa si tu backend lo llamó "productos" o "detalles"
        const listaDetallesRaw:DetalleProformaResponseDTO[] = data.productos ||  [];
        console.log('Colección de ítems detectada para procesar:', listaDetallesRaw);

        this.items = listaDetallesRaw.map((item: DetalleProformaResponseDTO, index: number) => {
          // // Extraemos el subobjeto producto si viene mapeado por Hibernate
          // const prod = item.producto || item;
          // const cantidadItem = item.cantidad || 0;
          // const precioItem = item.precioUnitario || item.precio_unitario || 0;

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
    const idProformaSeleccionada = this.ordenRequest.idProforma;
    const idRequerimientoSeleccionado = this.ordenRequest.idRequerimiento;

    if (!idProformaSeleccionada || !idRequerimientoSeleccionado || !this.ordenRequest.fechaEntrega || !this.ordenRequest.lugarEntrega) {
      alert('Por favor, completa los campos requeridos (*): Asegura ingresar la fecha de entrega y el destino real.');
      return;
    }

    // Formateamos los detalles de la orden acoplándolos a la relación de entidades de tu Backend
    const itemsFormateadosJava = this.items.map(item => ({
      producto: { idProducto: item.idProducto }, 
      cantidad: item.cantidad,
      precioUnitario: item.precioUnit, 
      subtotal: item.subtotal
    }));

    const payloadFinal: OrdenRequestDTO = {
      codigo: this.ordenRequest.nroOrden, 
      descripcion: this.ordenRequest.observaciones || 'Orden de compra generada desde el formulario',
      estado: 'PENDIENTE',
      fechaCreacion: this.ordenRequest.fechaEmision,
      fechaEntrega: this.ordenRequest.fechaEntrega,
      montoTotal: this.total, 
      idProforma: Number(idProformaSeleccionada),
      idProveedor: Number(this.proveedorSeleccionado?.idProveedor || 0 ), 
      items: itemsFormateadosJava,

  
      lugarEntrega: this.ordenRequest.lugarEntrega,
      observaciones: this.ordenRequest.observaciones,
      formaPago: this.ordenRequest.formaPago,
      plazoEntrega: this.ordenRequest.plazoEntrega,
      garantia: this.ordenRequest.garantia

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






// // Estructura limpia para enviar a @RequestBody OrdenRequestDTO de Spring Boot
//   ordenRequest: any = {
//     nroOrden: '', 
//     fechaEmision: new Date().toISOString().substring(0, 10), 
//     fechaEntrega: '',
//     idRequerimiento: null,
//     idProforma: null,
//     formaPago: '',
//     plazoEntrega: '',
//     garantia: '',
//     lugarEntrega: '',
//     observaciones: ''
//   };

//   // Arreglos dinámicos que se poblarán desde la Base de Datos (Neon)
//   requerimientosList: any[] = [];
//   proformaList: any[] = [];

//   // Objeto reactivo para pintar el proveedor de la proforma seleccionada
//   proveedorSeleccionado: any = null;

//   // Arreglo de productos que llega dinámicamente desde el backend
//   items: any[] = [];

//   // Totales calculados en tiempo real matemáticamente
//   subtotal: number = 0;
//   igv: number = 0;
//   total: number = 0;

//   constructor(
//     private ordenService: OrdencompraService,
//     private requerimientoService: RequerimientoService, // 👈 Inyecta para jalar datos reales de Neon
//     private proformaService: ProformaService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.cargarCombosDesdeBackend();
//   }

//   // 1. EXTRAE REQUERIMIENTOS Y PROFORMAS DIRECTAMENTE DEL SERVIDOR
//   cargarCombosDesdeBackend(): void {
//     // REQUERIMIENTOS REALES:
//     // this.requerimientoService.listarActivos().subscribe({
//     //   next: (data) => this.requerimientosList = data,
//     //   error: (err) => console.error('Error al traer requerimientos:', err)
//     // });

//     // PROFORMAS REALES:
//     // this.proformaService.listarAprobadas().subscribe({
//     //   next: (data) => this.proformaList = data,
//     //   error: (err) => console.error('Error al traer proformas:', err)
//     // });

//     this.proformaService.listarRequerimientosAprobados().subscribe({
//       next: (data) => {
//         this.requerimientosList = data;
//         console.log('Requerimientos cargados:', data);
//       },
//       error: (err) => console.error('Error al traer requerimientos:', err)
//     });

//     // PROFORMAS: Trae las ganadoras en estado "ELEGIDA"
//     this.proformaService.listarElegidas().subscribe({
//       next: (data) => {
//         this.proformaList = data;
//         console.log('Proformas elegidas cargadas:', data);
//       },
//       error: (err) => console.error('Error al traer proformas:', err)
//     });
//   }

//   // 2. DETECTA EL CAMBIO DE PROFORMA Y SOLICITA SUS ÍTEMS Y PROVEEDOR AL BACKEND
//   onProformaChange(): void {
//     const idProformaSeleccionada = this.ordenRequest.idProforma;
  
//   if (!idProformaSeleccionada) {
//     this.limpiarDatosDinamicos();
//     return;
//   }

//   console.log('Consultando detalles completos de proforma ID:', idProformaSeleccionada);

//   this.ordenService.consultarPorId(idProformaSeleccionada).subscribe({
//     next: (data: any) => {
//       console.log('JSON crudo recibido desde Spring Boot:', data);
      
//       // 1. Mapear Proveedor de forma segura
//       this.proveedorSeleccionado = data.proveedor || {
//         razonSocial: data.razonSocialProveedor || data.razon_social || 'SUDAB S.A.C.',
//         ruc: data.rucProveedor || data.ruc || '20123456789',
//         direccion: data.direccionProveedor || data.direccion || 'Dirección Fiscal',
//         contacto: data.contactoProveedor || data.contacto || 'Contacto Directo',
//         telefono: data.telefonoProveedor || data.telefono || 'N/A'
//       };

//       this.ordenRequest.plazoEntrega = data.plazoEntrega || '15 días hábiles';
//       this.ordenRequest.garantia = data.garantia || '12 meses';

//       // 2. Extraer la lista intermedia (Soporta si tu DTO lo llamó productos, items, detalles o proformaDetalles)
//       const listaDetallesRaw = data.productos || data.items || data.detalles || data.proformaDetalles || [];
//       console.log('Colección de productos detectada:', listaDetallesRaw);

//       // 3. 📌 AQUÍ ESTÁ EL PARCHE CRÍTICO DE VISUALIZACIÓN:
//       // Mapeamos las sub-propiedades del objeto 'producto' que Hibernate recuperó con el LEFT JOIN
//       this.items = listaDetallesRaw.map((item: any, index: number) => {
        
//         // Buscamos los valores numéricos mapeando nombres con guión bajo o CamelCase
//         const precio = item.precioUnitario || item.precio_unitario || item.precio || 0;
//         const cant = item.cantidad || 0;
        
//         return {
//           num: index + 1,
//           // Si tu backend anidó el producto dentro del detalle: item.producto.codigo
//           codigo: item.codigoProducto || (item.producto ? item.producto.codigo : `PROD-${item.idProducto}`),
          
//           // Captura el nombre real del insumo desde el p2_0.nombre u objeto producto
//           descripcion: item.nombreProducto || item.descripcion || (item.producto ? (item.producto.nombre || item.producto.descripcion) : 'Insumo registrado'),
          
//           unidad: item.unidadMedida || (item.producto ? item.producto.unidadMedida : 'Unidad'),
//           cantidad: cant,
//           precioUnit: precio,
//           subtotal: cant * precio
//         };
//       });

//       console.log('Lista de ítems procesada y lista para renderizar en el HTML:', this.items);
//       this.calcularTotales();
//     },
//     error: (err) => {
//       console.error('Error crítico al solicitar la proforma en el Front:', err);
//       this.limpiarDatosDinamicos();
//     }
//   });
//   }

//   // 3. OPERACIÓN MATEMÁTICA REACTIVA SIN INTERFERENCIA DE DATOS FIJOS
//   calcularTotales(): void {
//     let sumaSubtotales = 0;
//     this.items.forEach(item => {
//       item.subtotal = item.cantidad * item.precioUnit;
//       sumaSubtotales += item.subtotal;
//     });

//     this.subtotal = sumaSubtotales;
//     this.igv = this.subtotal * 0.18; // Impuesto general de ley
//     this.total = this.subtotal + this.igv;
//   }

//   limpiarDatosDinamicos(): void {
//     this.proveedorSeleccionado = null;
//     this.items = [];
//     this.subtotal = 0;
//     this.igv = 0;
//     this.total = 0;
//   }

//   // 4. POSTEA EL PAYLOAD COMPLETO A TU CONTROLADOR DE SPRING BOOT
//   guardarOrden(): void {
// // Aseguramos capturar el ID de requerimiento base si la proforma ya lo traía amarrado
//   const idProformaSeleccionada = this.ordenRequest.idProforma;
  
//   console.log('Validando payload final antes de persistir en Neon...');

//   // Si no seleccionaron un requerimiento independiente en el combo, jalamos el del requerimiento base
//   if (!this.ordenRequest.idRequerimiento && this.requerimientosList.length > 0) {
//     // Parche de seguridad: le asignamos el ID 1 por defecto para que Postgres no bote error de clave foránea
//     this.ordenRequest.idRequerimiento = 1; 
//   }

//   if (!idProformaSeleccionada || !this.ordenRequest.fechaEntrega || !this.ordenRequest.lugarEntrega) {
//     alert('Por favor, completa los campos requeridos (*): Asegura ingresar la fecha de entrega y el destino real.');
//     return;
//   }

//   // 📌 MAPEO PROFESIONAL DEL PAYLOAD PARA @RequestBody EN SPRING BOOT:
//   // Renombramos las propiedades dinámicas de la tabla de Angular para que calcen con las variables de Java
//   const itemsFormateadosJava = this.items.map(item => ({
//     idProducto: item.idProducto || 1, // Enlaza el ID físico del producto
//     cantidad: item.cantidad,
//     precioUnitario: item.precioUnit, // 👈 Cambiado a precioUnitario para que coincida con tu entidad OrdenCompraDetalle
//     subtotal: item.subtotal
//   }));

//   const payloadFinal = {
//     nroOrden: this.ordenRequest.nroOrden || 'OC-' + Math.floor(Math.random() * 9000 + 1000), // Código auto-generado por si acaso
//     fechaEmision: this.ordenRequest.fechaEmision,
//     fechaEntrega: this.ordenRequest.fechaEntrega,
//     idRequerimiento: Number(this.ordenRequest.idRequerimiento),
//     idProforma: Number(idProformaSeleccionada),
//     formaPago: this.ordenRequest.formaPago || 'Contado',
//     plazoEntrega: this.ordenRequest.plazoEntrega,
//     garantia: this.ordenRequest.garantia,
//     lugarEntrega: this.ordenRequest.lugarEntrega,
//     observaciones: this.ordenRequest.observaciones,
//     montoTotal: this.total, // El monto neto liquidado final
//     items: itemsFormateadosJava // Mandamos la lista de detalles alineada a tu Backend
//   };

//   console.log('Enviando JSON final compatible con Spring Boot:', payloadFinal);

//   // Ejecutamos el envío HTTP POST al backend unificado
//   this.ordenService.crearOrden(payloadFinal).subscribe({
//     next: (response) => {
//       console.log('Orden guardada con éxito en Neon DB:', response);
//       alert('¡Orden de Compra generada de forma exitosa en el sistema SUDAB!');
//       this.router.navigate(['/compras/lista']); // Te redirecciona automáticamente a tu bandeja limpia
//     },
//     error: (err) => {
//       console.error('Fallo crítico en la inserción HTTP POST:', err);
//       // Extrae el mensaje de error explícito que manda Java para ver qué columna falló
//       const mensajeErrorJava = err.error?.message || 'Conflicto de integridad de llaves foráneas';
//       alert('Error al guardar en la base de datos: ' + mensajeErrorJava + '\nRevisa la terminal de Spring Boot.');
//     }
//   });
//   }

//   cancelar(): void {
//     this.router.navigate(['/compras/lista']);
//   }
}
