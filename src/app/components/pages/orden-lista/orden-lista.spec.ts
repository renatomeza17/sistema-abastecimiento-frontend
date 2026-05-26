import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenLista } from './orden-lista';

describe('OrdenLista', () => {
  let component: OrdenLista;
  let fixture: ComponentFixture<OrdenLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenLista],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdenLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
