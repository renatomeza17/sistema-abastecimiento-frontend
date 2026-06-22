import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoRequestDTO } from '../api/request/pedido-requestDTO';
import { PedidoResponseDTO } from '../api/response/pedido-responseDTO';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  
  private readonly apiUrl = 'http://localhost:8080/api/pedidos';
  // Ajusta la URL de productos según tu controlador real
  private readonly prodUrl = 'http://localhost:8080/api/productos'; 

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

// Importación interna auxiliar de la estructura compartida
import { CatalogProducto } from '../models/registro_pedido/pedido';