import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../environment/environment';
import { OrdenResponseDTO } from '../api/response/ordenResponseDTO';

@Injectable({
  providedIn: 'root',
})
export class Recepcion {

  private ordenesUrl = `${environment.apiUrl}/api/ordenes`;
  private pedidosPendientesUrl = `${environment.apiUrl}/api/pedidos-pendientes`;

  constructor(private http: HttpClient) {}

  listarOrdenesParaVerificacion(): Observable<OrdenResponseDTO[]> {
    return this.http.get<OrdenResponseDTO[]>(this.ordenesUrl);
  }

  consultarOrden(id: number): Observable<OrdenResponseDTO> {
    return this.http.get<OrdenResponseDTO>(`${this.ordenesUrl}/${id}`);
  }

  recepcionarOrden(id: number): Observable<OrdenResponseDTO> {
    return this.http.put<OrdenResponseDTO>(`${this.ordenesUrl}/${id}/recepcionar`, {});
  }

  registrarPedidoPendiente(idOrden: number, motivo: string): Observable<any> {
    return this.http.post(
      `${this.pedidosPendientesUrl}?idOrden=${idOrden}&motivo=${encodeURIComponent(motivo)}`,
      {}
    );
  }

  listarPedidosPendientes(): Observable<any[]> {
    return this.http.get<any[]>(this.pedidosPendientesUrl);
  }

  resolverPedidoPendiente(idPedidoPendiente: number): Observable<any> {
    return this.http.put(
      `${this.pedidosPendientesUrl}/${idPedidoPendiente}/resolver`,
      {}
    );
  }
}