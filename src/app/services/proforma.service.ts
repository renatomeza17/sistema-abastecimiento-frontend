import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProformaResponseDTO } from '../api/response/requerimiento-response';
import { ProformaRequestDTO } from '../api/request/requerimiento-request';

@Injectable({
  providedIn: 'root',
})
export class ProformaService {
  private urlProformas = `${environment.apiUrl}/api/proformas`;

  constructor(private http: HttpClient) { }

  crear(dto: ProformaRequestDTO): Observable<ProformaResponseDTO> {
    // El backend interceptará el token JWT y le asignará el proveedor correspondiente
    return this.http.post<ProformaResponseDTO>(this.urlProformas, dto);
  }

  // REFACTORIZADO: Ya no le pasamos el ID por parámetro de URL
  porProveedorLogueado(): Observable<ProformaResponseDTO[]> {
    return this.http.get<ProformaResponseDTO[]>(`${this.urlProformas}/mis-proformas`);
  }

  listarElegidas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlProformas}/elegidas`);
  }

  consultarPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.urlProformas}/${id}`);
  }

  listarPorRequerimiento(idRequerimiento: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlProformas}/requerimiento/${idRequerimiento}`);
  }

  elegir(id: number): Observable<ProformaResponseDTO> {
    return this.http.patch<ProformaResponseDTO>(`${this.urlProformas}/${id}/elegir`, {});
  }
}