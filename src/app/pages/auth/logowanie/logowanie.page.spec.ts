import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogowaniePage } from './logowanie.page';

describe('LogowaniePage', () => {
  let component: LogowaniePage;
  let fixture: ComponentFixture<LogowaniePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LogowaniePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
