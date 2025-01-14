import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RejestracjaPageRoutingModule } from './rejestracja-routing.module';
import { RejestracjaPage } from './rejestracja.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RejestracjaPageRoutingModule
  ],
  declarations: [RejestracjaPage]

})
export class RejestracjaPageModule {}