export interface ModuloPermiso {
  descripcion: string;
  url: string;
  puedeCrear: string;
  puedeLeer: string;
  puedeActualizar: string;
  puedeEliminar: string;
}

export interface Rol {
    idRol?: number;
    nombre: string;
    descripcion?: string;
    modulos?: ModuloPermiso[];
}