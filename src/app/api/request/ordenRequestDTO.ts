export interface OrdenRequestDTO {
    idProforma: number;
    codigo:string;
    descripcion:string;
    estado:string;
    fechaCreacion:string;
    montoTotal: number;
    fechaEntrega: string;
    lugarEntrega: string;
    observaciones: string;
    idProveedor: number;
    items: any[];
    formaPago: string;
    plazoEntrega: string;
    garantia: string;
    
}
