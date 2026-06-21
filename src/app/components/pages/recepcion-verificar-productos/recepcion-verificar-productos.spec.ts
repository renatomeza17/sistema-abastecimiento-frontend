import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionVerificarProductos } from './recepcion-verificar-productos';

describe('RecepcionVerificarProductos', () => {
  let component: RecepcionVerificarProductos;
  let fixture: ComponentFixture<RecepcionVerificarProductos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepcionVerificarProductos],
    }).compileComponents();

    fixture = TestBed.createComponent(RecepcionVerificarProductos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
