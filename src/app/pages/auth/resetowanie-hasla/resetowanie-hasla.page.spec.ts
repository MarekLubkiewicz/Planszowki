import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetowanieHaslaPage } from './resetowanie-hasla.page';

describe('ResetowanieHaslaPage', () => {
  let component: ResetowanieHaslaPage;
  let fixture: ComponentFixture<ResetowanieHaslaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetowanieHaslaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
