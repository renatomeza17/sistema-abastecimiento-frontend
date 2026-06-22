export interface ItemFilaPedido {
  idProducto: number;
  nombreProducto: string;
  unidadMedida: string;
  cantidad: number;
  observacionEspecifica: string;
}

export interface CatalogProducto {
  idProducto: number;
  nombre: string;
  unidadMedida: string;
  precio?: number; // Opcional por si escala en el futuro
}