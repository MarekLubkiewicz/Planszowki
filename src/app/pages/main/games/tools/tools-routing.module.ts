import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ToolsPage } from './tools.page';

const routes: Routes = [
  {
    path: '',
    component: ToolsPage,
    children: [
      {
        path: 'dices',
        loadChildren: () => import('../dices/dices.module').then( m => m.DicesPageModule)
      },
      {
        path: 'timer',
        loadChildren: () => import('../timer/timer.module').then( m => m.TimerPageModule)
      },
      {
        path: 'future',
        loadChildren: () => import('../future/future.module').then( m => m.FuturePageModule)
      },
      {
        path: '',
        redirectTo: 'dices',
        pathMatch: 'full'
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ToolsPageRoutingModule {}
