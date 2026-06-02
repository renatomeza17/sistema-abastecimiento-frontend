export interface OrdenRequestDTO {
    idProforma: number;
    fechaEntrega: string;
    lugarEntrega: string;
    observaciones?: string;
    formaPago: string;
    plazoEntrega: string;
    garantia: string;
    
}
