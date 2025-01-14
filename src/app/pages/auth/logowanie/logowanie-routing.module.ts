import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LogowaniePage } from './logowanie.page';

const routes: Routes = [
  {
    path: '',
    component: LogowaniePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogowaniePageRoutingModule {}
