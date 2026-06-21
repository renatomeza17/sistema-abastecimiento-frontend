import { Producto } from "../Producto";


export interface Kardex {
  idKardex: number;
  producto: Producto;
  stockActual: number;
  stockMinimo: number;
  ubicacionAlmacen: string;
  fechaApertura: string; 
  caracteristicas: string;
}