import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DependenciaRegistroPedidoComponent } from './dependencia-registro-pedido';

describe('DependenciaRegistroPedido', () => {
  let component: DependenciaRegistroPedidoComponent;
  let fixture: ComponentFixture<DependenciaRegistroPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DependenciaRegistroPedidoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DependenciaRegistroPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
