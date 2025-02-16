import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FuturePageRoutingModule } from './future-routing.module';

import { FuturePage } from './future.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FuturePageRoutingModule
  ],
  declarations: [FuturePage]
})
export class FuturePageModule {}
