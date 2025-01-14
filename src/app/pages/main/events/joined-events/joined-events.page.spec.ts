import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JoinedEventsPage } from './joined-events.page';

describe('JoinedEventsPage', () => {
  let component: JoinedEventsPage;
  let fixture: ComponentFixture<JoinedEventsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinedEventsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
