import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RejestracjaPage } from './rejestracja.page';

describe('RejestracjaPage', () => {
  let component: RejestracjaPage;
  let fixture: ComponentFixture<RejestracjaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RejestracjaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
