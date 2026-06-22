export interface PedidoDetalleRequestDTO {
  idProducto: number;
  cantidad: number;
  observacionEspecifica?: string;
}

export interface PedidoRequestDTO {
  descripcion: string;
  detalles: PedidoDetalleRequestDTO[];
}