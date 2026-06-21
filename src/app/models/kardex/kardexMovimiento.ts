export interface KardexMovimiento {
  idMovimiento: number;
  idKardex: number;
  tipoMovimiento: 'ENTRADA' | 'SALIDA';
  cantidad: number;
  saldoStock: number;
  fechaMovimiento: string;
  documentoReferencia: string;
  observaciones: string;
}