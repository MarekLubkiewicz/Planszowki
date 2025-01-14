import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JoinedEventsPageRoutingModule } from './joined-events-routing.module';

import { JoinedEventsPage } from './joined-events.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JoinedEventsPageRoutingModule
  ],
  declarations: [JoinedEventsPage]
})
export class JoinedEventsPageModule {}
