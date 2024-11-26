import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { WebsiteModule } from '../website.module';
import { EventsRoutingModule } from './events-routing.module';
import { EventDashboardComponent } from './pages/event-dashboard/event-dashboard.component';
import { EventCreateDialogComponent } from './components/event-create-dialog/event-create-dialog.component';
import { EventEditDialogComponent } from './components/event-edit-dialog/event-edit-dialog.component';
import { CreateEventStepperComponent } from './components/create-event-stepper/create-event-stepper.component';
import { EditEventStepperComponent } from './components/edit-event-stepper/edit-event-stepper.component';
@NgModule({
  declarations: [
    LayoutPageComponent,
    EventDashboardComponent,
    EventCreateDialogComponent,
    EventEditDialogComponent,
    CreateEventStepperComponent,
    EditEventStepperComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    EventsRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    WebsiteModule,
  ],
})
export class EventsModule {}
