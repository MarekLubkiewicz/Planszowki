import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameInfoPage } from './game-info.page';

describe('GameInfoPage', () => {
  let component: GameInfoPage;
  let fixture: ComponentFixture<GameInfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GameInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
