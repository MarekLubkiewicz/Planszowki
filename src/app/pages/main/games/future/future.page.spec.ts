import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FuturePage } from './future.page';

describe('FuturePage', () => {
  let component: FuturePage;
  let fixture: ComponentFixture<FuturePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FuturePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
