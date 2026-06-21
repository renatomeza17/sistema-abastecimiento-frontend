export interface KardexRequestDTO {
  idProducto: number | null;
  stockMinimo: number;
  ubicacionAlmacen: string; // Un solo String plano (Ej: "Zona A - Estante 01 - Nivel 01")
  caracteristicas: string;

}