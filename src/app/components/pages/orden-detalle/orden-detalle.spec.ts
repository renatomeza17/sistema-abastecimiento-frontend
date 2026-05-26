import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenDetalle } from './orden-detalle';

describe('OrdenDetalle', () => {
  let component: OrdenDetalle;
  let fixture: ComponentFixture<OrdenDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenDetalle],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdenDetalle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
