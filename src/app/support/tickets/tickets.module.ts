import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { SupportModule } from '../support.module';
import { TicketRoutingModule } from './tickets-routing.module';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { TicketsDashboardComponent } from './pages/tickets-dashboard/tickets-dashboard.component';
import { TicketsListComponent } from './pages/tickets-list/tickets-list.component';
import { TicketsViewComponent } from './pages/tickets-view/tickets-view.component';
import { TicketsCreateComponent } from './pages/tickets-create/tickets-create.component';

import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TicketStatusPipe } from './pipes/ticket-status.pipe';
import { TicketTypePipe } from './pipes/ticket-type.pipe';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { LocalDatePipe } from './pipes/local-date.pipe';
import { RelativeTimePipe } from './pipes/relative-time.pipe';
import { TicketCardComponent } from './components/ticket-card/ticket-card.component';
import { AngularMaterialModule } from 'src/app/shared/angular-material/angular-material.module';
import { NewTicketDialogComponent } from './components/new-ticket-dialog/new-ticket-dialog.component';
@NgModule({
  declarations: [
    LayoutPageComponent,
    TicketsDashboardComponent,
    TicketsListComponent,
    TicketsViewComponent,
    TicketsCreateComponent,
    TicketCardComponent,
    NewTicketDialogComponent,
    TicketStatusPipe,
    TicketTypePipe,
    LocalDatePipe,
    RelativeTimePipe,
  ],
  imports: [
    CommonModule,
    SharedModule,
    SupportModule,
    TicketRoutingModule,
    NgxMaskDirective,
    NgxMaskPipe,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    BsDatepickerModule.forRoot(),
  ],
  providers: [DatePipe, provideNgxMask()],
})
export class TicketsModule { }
