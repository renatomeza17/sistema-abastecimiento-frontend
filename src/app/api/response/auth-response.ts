export interface AuthResponse {
    token: string;
    username: string;
    nombreCompleto: string;
    roles: string[];
    modulos: Modulo[];
}

export interface Modulo {
    descripcion: string;
    url: string;
}