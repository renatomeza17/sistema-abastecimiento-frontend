import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionVerificarProductosComponent } from './recepcion-verificar-productos';

describe('RecepcionVerificarProductos', () => {
  let component: RecepcionVerificarProductosComponent;
  let fixture: ComponentFixture<RecepcionVerificarProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepcionVerificarProductosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecepcionVerificarProductosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
