
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { RequerimientoRequestDTO } from '../api/request/requerimiento-request';
import { RequerimientoResponseDTO } from '../api/response/requerimiento-response';

@Injectable({
  providedIn: 'root',
})
export class RequerimientoService {

  // URL base apuntando exactamente al @RequestMapping("/api/requerimientos") de tu Java
  private apiUrl = `${environment.apiUrl}/api/requerimientos`;

  constructor(private http: HttpClient) { }
  // Implementación real con tipos específicos y mejor manejo de URLs
  
  // Crear un nuevo requerimiento con el DTO específico
   crear(dto: RequerimientoRequestDTO): Observable<RequerimientoResponseDTO> {
     return this.http.post<RequerimientoResponseDTO>(this.apiUrl, dto);
   }

   // Listar todos los requerimientos sin filtro
   listar(): Observable<RequerimientoResponseDTO[]> {
     return this.http.get<RequerimientoResponseDTO[]>(this.apiUrl);
   }

   // Listar requerimientos filtrados por estado específico
   listarPorEstado(estado: string): Observable<RequerimientoResponseDTO[]> {
     return this.http.get<RequerimientoResponseDTO[]>(
       `${this.apiUrl}/estado/${estado}`
     );
   }
   
   // Obtener el detalle completo de un requerimiento por su ID único
   obtener(id: number): Observable<RequerimientoResponseDTO> {
     return this.http.get<RequerimientoResponseDTO>(`${this.apiUrl}/${id}`);    
    }

    // Cambiar el estado de un requerimiento (ej. APROBADO, CANCELADO)
   cambiarEstado(id: number, estado: string): Observable<RequerimientoResponseDTO> {
     return this.http.patch<RequerimientoResponseDTO>(
       `${this.apiUrl}/${id}/estado`,
       null,
     { params: { estado } }
     );
   }

}

