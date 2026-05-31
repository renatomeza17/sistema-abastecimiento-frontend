import { Proveedor } from "../Proveedor";
import { Proforma } from "../requerimiento/Proforma";
import { OrdenCompraDetalle } from "./ordenCompraDetalle";

export interface ordenCompra{
    idOrden: number;
    codigo: string;
    descripcion: string;
    fechaCreacion: string; // Mapeo de LocalDate
    fechaEntrega: string; // Mapeo de LocalDate
    estado: string;
    montoTotal: number;
    
    proforma: Proforma; // Enlace a la proforma completa con toda su jerarquía
    proveedor: Proveedor; // Enlace al proveedor completo
    detalles: OrdenCompraDetalle[];

    


}