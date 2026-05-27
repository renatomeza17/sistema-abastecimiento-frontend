import { TestBed } from '@angular/core/testing';

import { ProformaService } from './proforma.service';

describe('ProformaService', () => {
  let service: ProformaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProformaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
