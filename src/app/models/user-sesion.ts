import { Modulo } from "../api/response/auth-response";

export interface UserSesion {
  token: string;
  username: string;
  nombreCompleto: string;
  roles: string[];
  modulos: Modulo[];
}
