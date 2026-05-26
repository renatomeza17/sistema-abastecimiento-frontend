import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { RequerimientoRequestDTO } from '../api/request/requerimiento-request';
import { RequerimientoResponseDTO } from '../api/response/requerimiento-response';

@Injectable({ providedIn: 'root' })
export class RequerimientoService {

  private apiUrl = `${environment.apiUrl}/api/requerimientos`;

  constructor(private http: HttpClient) {}

  crear(dto: RequerimientoRequestDTO): Observable<RequerimientoResponseDTO> {
    return this.http.post<RequerimientoResponseDTO>(this.apiUrl, dto);
  }

  listar(): Observable<RequerimientoResponseDTO[]> {
    return this.http.get<RequerimientoResponseDTO[]>(this.apiUrl);
  }

  listarPorEstado(estado: string): Observable<RequerimientoResponseDTO[]> {
    return this.http.get<RequerimientoResponseDTO[]>(
      `${this.apiUrl}/estado/${estado}`
    );
  }

  obtener(id: number): Observable<RequerimientoResponseDTO> {
    return this.http.get<RequerimientoResponseDTO>(`${this.apiUrl}/${id}`);
  }

  cambiarEstado(id: number, estado: string): Observable<RequerimientoResponseDTO> {
    return this.http.patch<RequerimientoResponseDTO>(
      `${this.apiUrl}/${id}/estado`,
      null,
      { params: { estado } }
    );
  }
}