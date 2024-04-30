import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { SupportModule } from '../support.module';
import { TicketRoutingModule } from './tickets-routing.module';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { TicketsDashboardComponent } from './pages/tickets-dashboard/tickets-dashboard.component';
import { TicketsListComponent } from './pages/tickets-list/tickets-list.component';
@NgModule({
  declarations: [LayoutPageComponent, TicketsDashboardComponent, TicketsListComponent],
  imports: [CommonModule, SharedModule, SupportModule, TicketRoutingModule],

  // imports: [CommonModule, SharedModule, UsersModule, UserRoutingModule],
})
export class TicketsModule {}
