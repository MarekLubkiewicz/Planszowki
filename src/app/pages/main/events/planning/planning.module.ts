import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PlanningPageRoutingModule } from './planning-routing.module';
import { PlanningPage } from './planning.page';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PlanningPageRoutingModule
  ],
  declarations: [PlanningPage]
})
export class PlanningPageModule {}
