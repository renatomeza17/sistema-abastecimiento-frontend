export interface RequerimientoRequestDTO {
  descripcion: string;
  detalles: DetalleRequestDTO[];
}

export interface DetalleRequestDTO {
  idProducto: number;
  cantidad: number;
}

export interface ProformaRequestDTO {
  idRequerimiento: number;
  idProveedor: number;
  fechaRecepcion: string; // LocalDate viaja como string (YYYY-MM-DD)
  productos: DetalleProformaRequestDTO[];
}

export interface DetalleProformaRequestDTO {
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
}