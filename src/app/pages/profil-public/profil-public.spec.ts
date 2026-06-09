import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilPublic } from './profil-public';

describe('ProfilPublic', () => {
  let component: ProfilPublic;
  let fixture: ComponentFixture<ProfilPublic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilPublic],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilPublic);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
