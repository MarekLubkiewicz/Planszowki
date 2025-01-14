import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LogowaniePageRoutingModule } from './logowanie-routing.module';
import { LogowaniePage } from './logowanie.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LogowaniePageRoutingModule
  ],
  declarations: [LogowaniePage]

})
export class LogowaniePageModule {}
