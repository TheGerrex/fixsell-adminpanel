import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Priority, Status, Ticket } from 'src/app/support/interfaces/tickets.interface';

@Component({
  selector: 'support-ticket-card',
  templateUrl: './ticket-card.component.html',
  styleUrl: './ticket-card.component.scss'
})
export class TicketCardComponent {

  constructor(private authService: AuthService, private router: Router) { }

  @Input() ticket!: Ticket;

  statusTranslations: { [key in Status]: string } = {
    [Status.OPEN]: 'ABIERTO',
    [Status.IN_PROGRESS]: 'EN PROGRESO',
    [Status.WITHOUT_RESOLUTION]: 'SIN RESOLUCIÓN',
    [Status.COMPLETED]: 'COMPLETADO',
  };

  priorityTranslations: { [key in Priority]: string } = {
    [Priority.LOW]: 'Bajo',
    [Priority.MEDIUM]: 'Medio',
    [Priority.HIGH]: 'Alto',
  };

  onTicketClick(ticket: any): void {
    if (this.authService.hasPermission('canViewTicket')) {
      this.seeTicket(ticket);
    }
  }

  seeTicket(ticket: Ticket) {
    this.router.navigate(['/support/tickets/' + ticket.id]);
  }

  getStatusClass(ticket: Ticket): string {
    switch (this.getStatusTranslation(ticket.status)) {
      case 'ABIERTO':
        return 'status-open';
      case 'EN PROGRESO':
        return 'status-in-progress';
      case 'SIN RESOLUCIÓN':
        return 'status-without-resolution';
      case 'COMPLETADO':
        return 'status-completed';
      default:
        return '';
    }
  }

  getStatusTranslation(status: Status): string {
    return this.statusTranslations[status];
  }

  getPriorityClass(ticket: Ticket): string {
    switch (this.getPriorityTranslation(ticket.priority)) {
      case 'Bajo':
        return 'priority-low';
      case 'Medio':
        return 'priority-medium';
      case 'Alto':
        return 'priority-high';
      default:
        return '';
    }
  }

  getPriorityTranslation(priority: Priority): string {
    return this.priorityTranslations[priority];
  }
}
