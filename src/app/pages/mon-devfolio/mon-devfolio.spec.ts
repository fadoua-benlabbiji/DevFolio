import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonDevfolio } from './mon-devfolio';

describe('MonDevfolio', () => {
  let component: MonDevfolio;
  let fixture: ComponentFixture<MonDevfolio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonDevfolio],
    }).compileComponents();

    fixture = TestBed.createComponent(MonDevfolio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
