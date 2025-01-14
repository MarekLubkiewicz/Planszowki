import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GameInfoPageRoutingModule } from './game-info-routing.module';
import { GameInfoPage } from './game-info.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GameInfoPageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [GameInfoPage]
})
export class GameInfoPageModule {}
