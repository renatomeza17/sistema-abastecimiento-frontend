import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrdenResponseDTO } from '../api/response/ordenResponseDTO';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class OrdencompraService {


  private apiUrl = `${environment.apiUrl}/api/ordenes`;

  constructor(private http: HttpClient) { }

  // 1. Conseguir todas las órdenes para que las consuman tus bandejas
  listarTodas(): Observable<OrdenResponseDTO[]> {
    return this.http.get<OrdenResponseDTO[]>(this.apiUrl);
  }

  // 2. Buscar una orden por ID para el visor de detalles o impresión
  consultarPorId(id: number): Observable<OrdenResponseDTO> {
    return this.http.get<OrdenResponseDTO>(`${this.apiUrl}/${id}`);
  }

  // 3. Acción del Director Administrativo
  aprobarOrden(id: number): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/${id}/aprobar`, {}, { responseType: 'text' as 'json' });
  }

  // 4. Acción del Jefe de Abastecimiento
  enviarOrden(id: number): Observable<OrdenResponseDTO> {
    return this.http.post<OrdenResponseDTO>(`${this.apiUrl}/${id}/enviar`, {});
  }

  // 5. Acción del Almacenero
  archivarOrden(id: number): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/${id}/archivar`, {}, { responseType: 'text' as 'json' });
  }
  
}
