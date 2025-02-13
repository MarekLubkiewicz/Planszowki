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
        path: 'cards',
        loadChildren: () => import('../cards/cards.module').then( m => m.CardsPageModule)
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
