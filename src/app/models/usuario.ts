import { Persona } from "./persona";
import { Rol } from "./rol";

export interface Usuario {
    idUsuario?: number;
    username: string;
    password: string;
    email: string;
    persona: Persona;
    roles: Rol[];
}
