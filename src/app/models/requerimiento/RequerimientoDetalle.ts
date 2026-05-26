import { Producto } from "../Producto";


export interface RequerimientoDetalle {
  id?: number; 
  // Omitimos la referencia cíclica al objeto Requerimiento padre
  producto: Producto; // Relación @ManyToOne a Producto completo
  cantidad: number;
}