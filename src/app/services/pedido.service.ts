import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoRequestDTO } from '../api/request/pedido-requestDTO';
import { PedidoResponseDTO } from '../api/response/pedido-responseDTO';
import { environment } from '../environment/environment';
// Importación interna auxiliar de la estructura compartida
import { CatalogProducto } from '../models/registro_pedido/pedido';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = `${environment.apiUrl}/api/pedidos`;
  // Ajusta la URL de productos según tu controlador real
  private prodUrl = `${environment.apiUrl}/api/productos`;

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

  /**
   * Obtiene la lista de productos disponibles en el catálogo maestro.
   */
  obtenerCatalogoProductos(): Observable<CatalogProducto[]> {
    return this.http.get<CatalogProducto[]>(this.prodUrl);
  }
}

