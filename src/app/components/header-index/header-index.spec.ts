import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderIndex } from './header-index';

describe('HeaderIndex', () => {
  let component: HeaderIndex;
  let fixture: ComponentFixture<HeaderIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderIndex],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderIndex);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
