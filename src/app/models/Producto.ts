export interface Producto {
  idProducto?: number;
  nombre: string;
  descripcion: string;
  unidadMedida: string;
  stock: number;
  activo: boolean;
}