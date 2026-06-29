import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoRequestDTO } from '../api/request/pedido-requestDTO';
import { PedidoResponseDTO } from '../api/response/pedido-responseDTO';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = `${environment.apiUrl}/api/pedidos`;

  constructor(private http: HttpClient) { }

  /**
   * Envía un nuevo pedido al backend de manera segura.
   * El token JWT se inyecta automáticamente vía HTTP Interceptor.
   */
  crearPedido(request: PedidoRequestDTO): Observable<PedidoResponseDTO> {
    return this.http.post<PedidoResponseDTO>(`${this.apiUrl}/crear`, request);
  }

  /**
   * Obtiene el historial exclusivo de pedidos del usuario logueado.
   */
  listarMisPedidos(): Observable<PedidoResponseDTO[]> {
    return this.http.get<PedidoResponseDTO[]>(`${this.apiUrl}/mis-pedidos`);
  }
}

