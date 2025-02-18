import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FuturePage } from './future.page';

const routes: Routes = [
  {
    path: '',
    component: FuturePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FuturePageRoutingModule {}
