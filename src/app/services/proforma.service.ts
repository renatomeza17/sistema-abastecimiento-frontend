import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { ProformaRequestDTO } from '../api/request/requerimiento-request';
import { ProformaResponseDTO } from '../api/response/requerimiento-response';

@Injectable({ providedIn: 'root' })
export class ProformaService {

  private apiUrl = `${environment.apiUrl}/api/proformas`;

  constructor(private http: HttpClient) {}

  crear(dto: ProformaRequestDTO): Observable<ProformaResponseDTO> {
    return this.http.post<ProformaResponseDTO>(this.apiUrl, dto);
  }

  porRequerimiento(id: number): Observable<ProformaResponseDTO[]> {
    return this.http.get<ProformaResponseDTO[]>(
      `${this.apiUrl}/requerimiento/${id}`
    );
  }

  porProveedor(id: number): Observable<ProformaResponseDTO[]> {
    return this.http.get<ProformaResponseDTO[]>(
      `${this.apiUrl}/proveedor/${id}`
    );
  }

  elegir(id: number): Observable<ProformaResponseDTO> {
    return this.http.patch<ProformaResponseDTO>(
      `${this.apiUrl}/${id}/elegir`, null
    );
  }
}