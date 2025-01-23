import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlannedEventsPage } from './planned-events.page';

describe('PlannedEventsPage', () => {
  let component: PlannedEventsPage;
  let fixture: ComponentFixture<PlannedEventsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlannedEventsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
