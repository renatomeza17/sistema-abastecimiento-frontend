export interface OrdenFormModel {
  nroOrden: string;           
  fechaEmision: string;       
  idRequerimiento: number | null; // Selector temporal
  idProforma: number | null;      // Selector temporal
  
  // Los inputs reales que el usuario digita
  fechaEntrega: string;
  lugarEntrega: string;
  formaPago: string;
  plazoEntrega: string;
  garantia: string;
  observaciones: string;
}