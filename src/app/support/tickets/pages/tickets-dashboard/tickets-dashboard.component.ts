import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-tickets-dashboard',
  templateUrl: './tickets-dashboard.component.html',
  styleUrls: ['./tickets-dashboard.component.scss'],
})
export class TicketsDashboardComponent {
  constructor(private router: Router) {}

  isLoadingData = false;

  addTicket() {
    console.log('Add ticket');
  }

  openTickets() {
    console.log('Open tickets');
    console.log('routing to: /support/tickets/list');
    this.router.navigate(['/support/tickets/list']);
  }

  closedTickets() {
    console.log('Closed tickets');
    console.log('routing to: /support/tickets/list');
    this.router.navigate(['/support/tickets/list']);
  }
}
