import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'planned-events',
        loadChildren: () => import('../planned-events/planned-events.module').then(m => m.PlannedEventsPageModule)
      },
      {
        path: 'joined-events',
        loadChildren: () => import('../joined-events/joined-events.module').then(m => m.JoinedEventsPageModule)
      },
      {
        path: '',
        redirectTo: 'planned-events',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
