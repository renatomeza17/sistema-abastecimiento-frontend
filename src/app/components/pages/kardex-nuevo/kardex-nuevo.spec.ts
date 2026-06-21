import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KardexNuevo } from './kardex-nuevo';

describe('KardexNuevo', () => {
  let component: KardexNuevo;
  let fixture: ComponentFixture<KardexNuevo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KardexNuevo],
    }).compileComponents();

    fixture = TestBed.createComponent(KardexNuevo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
