import { TestBed } from '@angular/core/testing';

import { OrdencompraService } from './ordencompra.service';

describe('OrdencompraService', () => {
  let service: OrdencompraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdencompraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
