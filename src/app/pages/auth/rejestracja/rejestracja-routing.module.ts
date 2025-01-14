import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RejestracjaPage } from './rejestracja.page';

const routes: Routes = [
  {
    path: '',
    component: RejestracjaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RejestracjaPageRoutingModule {}
