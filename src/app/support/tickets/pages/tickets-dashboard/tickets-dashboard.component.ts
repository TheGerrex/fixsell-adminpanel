import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EventEmitter } from '@angular/core';
import { Status } from 'src/app/support/interfaces/tickets.interface';
@Component({
  selector: 'app-tickets-dashboard',
  templateUrl: './tickets-dashboard.component.html',
  styleUrls: ['./tickets-dashboard.component.scss'],
})
export class TicketsDashboardComponent {
  public loadTicketsEvent = new EventEmitter<Status>();

  constructor(private router: Router) {}

  isLoadingData = false;

  addTicket() {
    console.log('Add ticket');
    this.router.navigate(['/support/tickets/create']);
  }

  openTickets() {
    console.log('Open tickets');
    console.log('routing to: /support/tickets/list');
    this.router.navigate(['/support/tickets/list'], {
      queryParams: {
        status: [
          Status.OPEN,
          Status.IN_PROGRESS,
          Status.WITHOUT_RESOLUTION,
        ].join(','),
      },
    });
    this.loadTicketsEvent.emit(Status.OPEN);
  }

  closedTickets() {
    console.log('Closed tickets');
    console.log('routing to: /support/tickets/list');
    this.router.navigate(['/support/tickets/list'], {
      queryParams: { status: 'completed' },
    });
    this.loadTicketsEvent.emit(Status.COMPLETED);
  }
}
