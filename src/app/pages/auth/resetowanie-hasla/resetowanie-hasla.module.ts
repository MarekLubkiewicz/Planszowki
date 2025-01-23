import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResetowanieHaslaPageRoutingModule } from './resetowanie-hasla-routing.module';

import { ResetowanieHaslaPage } from './resetowanie-hasla.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResetowanieHaslaPageRoutingModule
  ],
  declarations: [ResetowanieHaslaPage]
})
export class ResetowanieHaslaPageModule {}
