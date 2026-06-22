export interface DetallePedidoResponseDTO {
  idDetallePedido: number;
  idProducto: number;
  nombreProducto: string;
  unidadMedida: string;
  cantidad: number;
  observacionEspecifica?: string;
}

export interface PedidoResponseDTO {
  idPedido: number;
  codigo: string;
  descripcion: string;
  estado: string;
  fechaCreacion: string; // Se maneja como String para recibir el formato ISO de Spring Boot
  nombreSolicitante: string;
  detalles: DetallePedidoResponseDTO[];
}