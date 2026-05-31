import { productoResponseDTO } from "./productoResponseDTO";
import { proveedorResponseDTO } from "./proveedorResponseDTO";

export interface RequerimientoResponseDTO {
  idRequerimiento: number;
  codigo: string;
  fechaCreacion: string;
  descripcion: string;
  estado: string;
  detalles: DetalleResponseDTO[];
}

export interface DetalleResponseDTO {
  idProducto: number;
  nombreProducto: string;
  unidadMedida: string;
  cantidad: number;
}

export interface ProformaResponseDTO {
  idProforma: number;
  codigo: string;
  fechaRecepcion: string;
  precioTotal: number;
  estado: string;
  idRequerimiento: number;
  codigoRequerimiento: string;
  proveedor: proveedorResponseDTO;
  idProveedor: number;

  plazoEntrega?: string;
  garantia?: string;
  
  razonSocialProveedor: string;
  productos: DetalleProformaResponseDTO[];
}

export interface DetalleProformaResponseDTO {
  idProformaDetalle: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;

  producto:productoResponseDTO;
  
  // idProducto: number;
  // nombreProducto: string;
  // unidadMedida: string;
  // cantidad: number;
  // precioUnitario: number;
  // subtotal: number;
}