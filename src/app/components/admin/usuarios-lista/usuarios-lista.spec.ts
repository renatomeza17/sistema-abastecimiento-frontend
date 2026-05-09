import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosLista } from './usuarios-lista';

describe('UsuariosLista', () => {
  let component: UsuariosLista;
  let fixture: ComponentFixture<UsuariosLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosLista],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
