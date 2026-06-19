import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../environment/environment';
import { OrdenResponseDTO } from '../api/response/ordenResponseDTO';

@Injectable({
  providedIn: 'root',
})
export class Recepcion {

  private apiUrl = `${environment.apiUrl}/api/ordenes`;

  constructor(private http: HttpClient) {}

  listarOrdenesParaVerificacion(): Observable<OrdenResponseDTO[]> {
  return this.http.get<OrdenResponseDTO[]>(this.apiUrl);
  }
  consultarOrden(id: number): Observable<OrdenResponseDTO> {
    return this.http.get<OrdenResponseDTO>(`${this.apiUrl}/${id}`);
  }

  recepcionarOrden(id: number): Observable<OrdenResponseDTO> {
    return this.http.put<OrdenResponseDTO>(`${this.apiUrl}/${id}/recepcionar`, {});
  }

  registrarPedidoPendiente(id: number, motivo: string): Observable<OrdenResponseDTO> {
    return this.http.put<OrdenResponseDTO>(
      `${this.apiUrl}/${id}/pedido-pendiente?motivo=${encodeURIComponent(motivo)}`,
      {}
    );
  }

  listarPedidosPendientes(): Observable<OrdenResponseDTO[]> {
    return this.http.get<OrdenResponseDTO[]>(`${this.apiUrl}/recepcion/pendientes`);
  }
}