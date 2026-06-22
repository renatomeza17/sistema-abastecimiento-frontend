import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DependenciaRegistroPedido } from './dependencia-registro-pedido';

describe('DependenciaRegistroPedido', () => {
  let component: DependenciaRegistroPedido;
  let fixture: ComponentFixture<DependenciaRegistroPedido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DependenciaRegistroPedido],
    }).compileComponents();

    fixture = TestBed.createComponent(DependenciaRegistroPedido);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
