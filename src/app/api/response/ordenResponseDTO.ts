import { OrdenDetalleResponseDTO } from "./ordenDetalleResponseDTO";

export interface OrdenResponseDTO{

    idOrden:number;
    codigo:string;
    fechaCreacion: string; // Usamos string para fechas en el frontend
    montoTotal:number;
    estado:string;

    nombreProveedor:string;
    rucProveedor:string;
    codigoRequerimiento:string;
    detalles: OrdenDetalleResponseDTO[];

    autorizadoPor?: string;
    firmaDigitalHash?: string;


}