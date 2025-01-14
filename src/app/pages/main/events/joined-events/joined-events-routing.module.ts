import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JoinedEventsPage } from './joined-events.page';

const routes: Routes = [
  {
    path: '',
    component: JoinedEventsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JoinedEventsPageRoutingModule {}
