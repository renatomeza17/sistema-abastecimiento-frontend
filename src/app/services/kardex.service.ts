import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { Observable } from 'rxjs';
import { Producto } from '../models/Producto';
import { HttpClient } from '@angular/common/http';
import { KardexRequestDTO } from '../api/request/kardexRequestDTO';
import { Kardex } from '../models/kardex/kardex';
import { KardexMovimiento } from '../models/kardex/kardexMovimiento';

@Injectable({
  providedIn: 'root',
})
export class KardexService {
  // Recuerda que hereda el context-path unificado sin barras duplicadas
  private baseUrl = `${environment.apiUrl}/api/kardex`;

  constructor(private http: HttpClient) { }

  // HU11: Obtener la lista de productos maestros que no tienen kárdex activo todavía
  obtenerProductosDisponibles(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos-disponibles`);
  }

  // HU11: Crear el nuevo asiento de Kárdex inicial
  crearNuevoAsiento(payload: KardexRequestDTO): Observable<Kardex> {
    return this.http.post<Kardex>(`${this.baseUrl}/nuevo-asiento`, payload);
  }

  // HU10: Obtener el historial completo de movimientos para la ficha técnica
  // obtenerHistorialMovimientos(idKardex: number): Observable<KardexMovimiento[]> {
  //   return this.http.get<KardexMovimiento[]>(`${this.baseUrl}/historial/${idKardex}`);


  // }

  obtenerHistorialMovimientos(idKardex: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${idKardex}/movimientos`);
  }


  obtenerInventarioGeneral(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  
  registrarMovimiento(payload: any): Observable<string> {
    return this.http.post(`${this.baseUrl}/movimiento`, payload, { responseType: 'text' });
  }



  

  
}
