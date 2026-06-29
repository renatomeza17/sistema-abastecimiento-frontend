import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { productoResponseDTO } from '../api/response/productoResponseDTO';

@Injectable({
  providedIn: 'root'
})

export class ProductoService {
    private apiUrl = `${environment.apiUrl}/api/productos`;

    constructor(private http: HttpClient) { }

    /**
     * * Obtiene la lista de productos disponibles en el catálogo maestro.
     * */
    obtenerCatalogoProductos(): Observable<productoResponseDTO[]> {
        return this.http.get<productoResponseDTO[]>(this.apiUrl);
    }
}