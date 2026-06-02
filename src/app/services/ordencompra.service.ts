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


  
   crearOrden(orden: any): Observable<OrdenResponseDTO> {
     return this.http.post<OrdenResponseDTO>(`${this.apiUrl}`, orden);
   }

   
  
  // crearOrden(orden: any): Observable<OrdenResponseDTO> {
  //    return this.http.post<OrdenResponseDTO>(`${this.apiUrl}/crearOrden`, orden);
  // }


  // 1. Conseguir todas las órdenes para que las consuman tus bandejas
  listarTodas(): Observable<OrdenResponseDTO[]> {
    return this.http.get<OrdenResponseDTO[]>(this.apiUrl);
  }

  // 2. Buscar una orden por ID para el visor de detalles o impresión
  consultarPorId(id: number): Observable<OrdenResponseDTO> {
    return this.http.get<OrdenResponseDTO>(`${this.apiUrl}/${id}`);
  }

  obtenerDetalleProforma(idProforma: number): Observable<any> {
  // Si en tu Java usas @RequestParam Long id en un ProformaController:
  return this.http.get<any>(`${this.apiUrl}/consultarOrden?id=${idProforma}`);
  
  // NOTA: Si ese endpoint está dentro de OrdenController y se llama consultarOrden, usa esta línea en su lugar:
  // return this.http.get<any>(`${this.apiUrl}/consultarOrden?id=${idProforma}`);
}

  // NUEVO MÉTODO: Conecta con el RequestParam de Spring Boot
  listarPorProveedor(idProveedor: number): Observable<OrdenResponseDTO[]> {
    return this.http.get<OrdenResponseDTO[]>(`${this.apiUrl}/listarPorProveedor?idProveedor=${idProveedor}`);
  }

  // 3. Acción del Director Administrativo
   aprobarOrden(id: number): Observable<string> {
     return this.http.put<string>(`${this.apiUrl}/${id}/aprobar`, {}, { responseType: 'text' as 'json' });
   }


   // 3. Acción del Director Administrativo
  autorizarYFirmar(id: number): Observable<OrdenResponseDTO> {
    return this.http.put<OrdenResponseDTO>(`${this.apiUrl}/aprobarOrden?id=${id}`, {});
  }

  // 4. Acción del Jefe de Abastecimiento
  enviarOrden(id: number): Observable<OrdenResponseDTO> {
    return this.http.post<OrdenResponseDTO>(`${this.apiUrl}/${id}/enviar`, {});
  }

  // 5. Acción del Almacenero
  archivarOrden(id: number): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/${id}/archivar`, {}, { responseType: 'text' as 'json' });
  }
  

  cancelarOrden(id: number): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/${id}/cancelar`, {}, { responseType: 'text' as 'json' });
  }
}
