import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResetowanieHaslaPage } from './resetowanie-hasla.page';

const routes: Routes = [
  {
    path: '',
    component: ResetowanieHaslaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResetowanieHaslaPageRoutingModule {}
