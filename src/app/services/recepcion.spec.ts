import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { Recepcion } from './recepcion';
import { environment } from '../environments/environment';

describe('Recepcion Service', () => {

  let service: Recepcion;
  let httpMock: HttpTestingController;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(Recepcion);
    httpMock = TestBed.inject(HttpTestingController);

  });

  afterEach(() => {
    httpMock.verify();
  });

  it('Debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('Debe listar las órdenes para verificación', () => {

    service.listarOrdenesParaVerificacion().subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/ordenes`);

    expect(req.request.method).toBe('GET');

    req.flush([]);

  });

  it('Debe consultar una orden por ID', () => {

    service.consultarOrden(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/ordenes/1`);

    expect(req.request.method).toBe('GET');

    req.flush({});

  });

  it('Debe confirmar la recepción de una orden', () => {

    service.recepcionarOrden(5).subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/api/ordenes/5/recepcionar`
    );

    expect(req.request.method).toBe('PUT');

    req.flush({});

  });

  it('Debe registrar un pedido pendiente', () => {

    service.registrarPedidoPendiente(5,'Producto dañado').subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/api/pedidos-pendientes?idOrden=5&motivo=Producto%20da%C3%B1ado`
    );

    expect(req.request.method).toBe('POST');

    req.flush({});

  });

});