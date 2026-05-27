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

  // Endpoints configurados en tus @RequestMapping de Java
  private urlProformas = `${environment.apiUrl}/api/proformas`;
  private urlRequerimientos = `${environment.apiUrl}/api/requerimientos`;
  private apiUrl = `${environment.apiUrl}/api/proformas`;

  constructor(private http: HttpClient) { }

  // Consume tu nuevo método para listar solo las proformas en estado "ELEGIDA"
  listarElegidas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlProformas}/elegidas`);
  }

  // Consume tu endpoint de requerimientos en estado "APROBADO" (o el listado general)
  listarRequerimientosAprobados(): Observable<any[]> {
    // Si manejas estados en mayúsculas en tu Java:
    return this.http.get<any[]>(`${this.urlRequerimientos}/estado/APROBADO`);

    
  }

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