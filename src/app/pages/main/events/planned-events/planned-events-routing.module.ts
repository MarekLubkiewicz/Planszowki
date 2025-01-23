import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlannedEventsPage } from './planned-events.page';

const routes: Routes = [
  {
    path: '',
    component: PlannedEventsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlannedEventsPageRoutingModule {}
