import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlannedEventsPageRoutingModule } from './planned-events-routing.module';

import { PlannedEventsPage } from './planned-events.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlannedEventsPageRoutingModule
  ],
  declarations: [PlannedEventsPage]
})
export class PlannedEventsPageModule {}
