
export interface Proveedor {

    idProveedor?: number; // El '?' lo hace opcional por si vas a registrar uno nuevo
    ruc: string;
    razonSocial: string;
    direccion: string;
    telefono: string;
    email: string;
    contacto: string;
    activo: boolean;

}