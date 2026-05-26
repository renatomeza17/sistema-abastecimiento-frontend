import { Producto } from "../Producto";


export interface OrdenCompraDetalle {
  id?: number; // Tu atributo exacto "private Long id;"
  producto: Producto; // Relación @ManyToOne
  cantidad: number;
  precioUnitario: number;
}