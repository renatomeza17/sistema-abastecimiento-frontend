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
  idProveedor: number;
  razonSocialProveedor: string;
  productos: DetalleProformaResponseDTO[];
}

export interface DetalleProformaResponseDTO {
  idProducto: number;
  nombreProducto: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}