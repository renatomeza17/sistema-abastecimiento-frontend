
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

  // 1. Listar todos los requerimientos registrados en Neon
  listarTodos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // 2. Filtrar requerimientos por estado (PENDIENTE, EN_PROCESO, CERRADO, APROBADO)
  // Llama directamente al @GetMapping("/estado/{estado}") del Backend
  listarPorEstado(estado: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/estado/${estado}`);
  }

  // 3. Ver el detalle completo de un requerimiento por su ID único
  obtenerPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // 4. Crear un nuevo requerimiento (Enviado por el Jefe de Abastecimiento)
  crear(requerimientoRequest: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, requerimientoRequest);
  }

  // 5. Cambiar el estado (Usado por el Director para APROBADO / CANCELADO)
  // Usa @PatchMapping y pasa el estado como un @RequestParam en la URL
  cambiarEstado(id: number, nuevoEstado: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/estado?estado=${nuevoEstado}`, {});
  }

  
  // crear(dto: RequerimientoRequestDTO): Observable<RequerimientoResponseDTO> {
  //   return this.http.post<RequerimientoResponseDTO>(this.apiUrl, dto);
  // }

  // listar(): Observable<RequerimientoResponseDTO[]> {
  //   return this.http.get<RequerimientoResponseDTO[]>(this.apiUrl);
  // }

  // listarPorEstado(estado: string): Observable<RequerimientoResponseDTO[]> {
  //   return this.http.get<RequerimientoResponseDTO[]>(
  //     `${this.apiUrl}/estado/${estado}`
  //   );
  // }

  // obtener(id: number): Observable<RequerimientoResponseDTO> {
  //   return this.http.get<RequerimientoResponseDTO>(`${this.apiUrl}/${id}`);
  // }

  // cambiarEstado(id: number, estado: string): Observable<RequerimientoResponseDTO> {
  //   return this.http.patch<RequerimientoResponseDTO>(
  //     `${this.apiUrl}/${id}/estado`,
  //     null,
  //     { params: { estado } }
  //   );
  // }

}

