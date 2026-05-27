import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProformaService {

  // Endpoints configurados en tus @RequestMapping de Java
  private urlProformas = `${environment.apiUrl}/api/proformas`;
  private urlRequerimientos = `${environment.apiUrl}/api/requerimientos`;

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
}
