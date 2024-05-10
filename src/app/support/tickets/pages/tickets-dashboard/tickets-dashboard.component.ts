import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventEmitter } from '@angular/core';
import { Status } from 'src/app/support/interfaces/tickets.interface';
import { CalendarView } from 'angular-calendar';
import { CalendarEvent } from 'angular-calendar';
import { Ticket, Priority } from '../../../interfaces/tickets.interface';
import { TicketsService } from 'src/app/support/services/tickets.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-tickets-dashboard',
  templateUrl: './tickets-dashboard.component.html',
  styleUrls: ['./tickets-dashboard.component.scss'],
})
export class TicketsDashboardComponent implements OnInit {
  public loadTicketsEvent = new EventEmitter<Status>();
  view: CalendarView = CalendarView.Month;
  constructor(
    private router: Router,
    private authService: AuthService,
    private ticketsService: TicketsService
  ) {
    /*...*/
  }

  isLoadingData = false;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  openTicketsCount: number = 0;
  closedTicketsCount: number = 0;

  ngOnInit() {
    this.loadUserTickets();
  }

  loadUserTickets() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.ticketsService.getAllTicketsForUser(user.id).subscribe(
        (tickets) => {
          this.populateCalendarWithTickets(tickets);
          this.openTicketsCount = tickets.filter((ticket) =>
            [
              Status.OPEN,
              Status.IN_PROGRESS,
              Status.WITHOUT_RESOLUTION,
            ].includes(ticket.status)
          ).length;
          this.closedTicketsCount = tickets.filter(
            (ticket) => ticket.status === Status.COMPLETED
          ).length;
        },
        (error) => {
          console.error('Error:', error);
        }
      );
    } else {
      console.error('No current user');
    }
  }

  populateCalendarWithTickets(tickets: any[]) {
    this.events = tickets.map((ticket) => {
      return {
        id: ticket.id, // ensure this line is present
        start: new Date(ticket.appointmentStartTime),
        end: new Date(ticket.appointmentEndTime),
        title: ticket.title,
        clientName: ticket.clientName,
        clientPhone: ticket.clientPhone,
        clientAddress: ticket.clientAddress,
        priority: ticket.Priority,
      };
    });
  }

  setDayView(): void {
    this.view = CalendarView.Day;
  }

  setWeekView(): void {
    this.view = CalendarView.Week;
  }

  setMonthView(): void {
    this.view = CalendarView.Month;
  }

  previousDay() {
    const date = new Date(this.viewDate);
    date.setDate(date.getDate() - 1);
    this.viewDate = date;
  }

  nextDay() {
    const date = new Date(this.viewDate);
    date.setDate(date.getDate() + 1);
    this.viewDate = date;
  }

  previousWeek() {
    const date = new Date(this.viewDate);
    date.setDate(date.getDate() - 7);
    this.viewDate = date;
  }

  nextWeek() {
    const date = new Date(this.viewDate);
    date.setDate(date.getDate() + 7);
    this.viewDate = date;
  }

  previousMonth() {
    const date = new Date(this.viewDate);
    date.setMonth(date.getMonth() - 1);
    this.viewDate = date;
  }

  nextMonth() {
    const date = new Date(this.viewDate);
    date.setMonth(date.getMonth() + 1);
    this.viewDate = date;
  }

  setView() {
    switch (this.view) {
      case 'day':
        this.setDayView();
        break;
      case 'week':
        this.setWeekView();
        break;
      case 'month':
        this.setMonthView();
        break;
    }
  }

  eventClicked({ event }: { event: CalendarEvent }): void {
    console.log('Event clicked', event);
    this.router.navigate(['/support/tickets/', event.id]);
  }

  dayClicked(date: Date): void {
    this.viewDate = date;
    this.view = CalendarView.Day;
  }

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
