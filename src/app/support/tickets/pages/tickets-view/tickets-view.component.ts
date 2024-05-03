import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Ticket, Status } from 'src/app/support/interfaces/tickets.interface';
import { TicketsService } from 'src/app/support/services/tickets.service';
import { Priority } from 'src/app/support/interfaces/tickets.interface';
import { User } from 'src/app/auth/interfaces';
import { UsersService } from 'src/app/users/services/users.service';
@Component({
  selector: 'app-tickets-view',
  templateUrl: './tickets-view.component.html',
  styleUrls: ['./tickets-view.component.scss'],
})
export class TicketsViewComponent implements OnInit {
  constructor(
    private ticketsService: TicketsService,
    private route: ActivatedRoute,
    private usersService: UsersService
  ) {
    this.ticket = {} as Ticket;
  }
  ticket: Ticket;
  ticketIssue = '';
  activities: { activity: string; readOnly: boolean }[] = [];
  issueReadOnly = true;
  isLoadingData = true;
  ticketNumber = 0;
  clientName = '';
  clientEmail = '';
  clientPhone = '';
  ticketPriority = '';
  assignedUser: string = ''; // Initialize the 'assignedUser' property
  users: User[] = [];
  // Add statusOptions and ticketStatus
  statusOptions = [
    { value: Status.OPEN, label: 'Abierto' },
    { value: Status.IN_PROGRESS, label: 'En progreso' },
    { value: Status.WITHOUT_RESOLUTION, label: 'Sin resolución' },
    { value: Status.COMPLETED, label: 'Completado' },
  ];
  ticketStatus = Status.OPEN; // Default status

  statusTranslations: { [key in Status]: string } = {
    [Status.OPEN]: 'abierto',
    [Status.IN_PROGRESS]: 'en progreso',
    [Status.WITHOUT_RESOLUTION]: 'sin resolución',
    [Status.COMPLETED]: 'completado',
  };

  statusColors: { [key in Status]: string } = {
    [Status.OPEN]: 'blue',
    [Status.IN_PROGRESS]: 'yellow',
    [Status.WITHOUT_RESOLUTION]: 'orange',
    [Status.COMPLETED]: 'green',
  };

  priorityTranslations: { [key in Priority]: string } = {
    [Priority.LOW]: 'bajo',
    [Priority.MEDIUM]: 'medio',
    [Priority.HIGH]: 'alto',
  };

  priorityColors: { [key in Priority]: string } = {
    [Priority.LOW]: 'green',
    [Priority.MEDIUM]: 'orange',
    [Priority.HIGH]: 'red',
  };

  getStatusColor(status: Status): string {
    return this.statusColors[status];
  }

  getStatusTranslation(status: Status): string {
    return this.statusTranslations[status];
  }

  getPriorityColor(priority: Priority): string {
    return this.priorityColors[priority];
  }

  getPriorityTranslation(priority: Priority): string {
    return this.priorityTranslations[priority];
  }

  getStatusClass(ticket: Ticket): string {
    switch (this.getStatusTranslation(ticket.status)) {
      case 'abierto':
        return 'status-open';
      case 'en progreso':
        return 'status-in-progress';
      case 'sin resolución':
        return 'status-without-resolution';
      case 'completado':
        return 'status-completed';
      default:
        return '';
    }
  }

  getPriorityClass(ticket: Ticket): string {
    switch (this.getPriorityTranslation(ticket.priority)) {
      case 'bajo':
        return 'priority-low';
      case 'medio':
        return 'priority-medium';
      case 'alto':
        return 'priority-high';
      default:
        return '';
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const ticketId = params.get('id');
      if (ticketId !== null) {
        this.getTicketIssue(ticketId);
      }
    });
    this.getUsers();
  }

  getUsers() {
    const token = localStorage.getItem('token');
    if (token !== null) {
      this.usersService.getUsers(token).subscribe((users: User[]) => {
        this.users = users;
      });
    }
  }

  getTicketIssue(ticketId: string) {
    this.ticketsService.getTicketById(ticketId).subscribe((ticket: Ticket) => {
      console.log('Ticket data:', ticket); // Log the ticket data
      this.isLoadingData = false;
      this.ticket = ticket; // Update the ticket property
      this.ticketIssue = ticket.issue;
      this.ticketNumber = ticket.id; // Set the ticket number
      this.ticketStatus = ticket.status; // Set the ticket status
      this.clientName = ticket.clientName;
      this.clientEmail = ticket.clientEmail;
      this.clientPhone = ticket.clientPhone;
      this.ticketPriority = ticket.priority;
      this.activities =
        ticket.activity && ticket.activity.length > 0
          ? ticket.activity.flatMap((activityGroup) =>
              activityGroup
                ? activityGroup.map((activity: string) => ({
                    activity,
                    readOnly: true,
                  }))
                : []
            )
          : [{ activity: '', readOnly: false }];
    });
  }

  loadTicketData() {
    this.isLoadingData = true;
    this.route.paramMap.subscribe((params) => {
      const ticketId = params.get('id');
      if (ticketId !== null) {
        this.ticketsService.getTicketById(ticketId).subscribe(
          (ticket: Ticket) => {
            this.ticket = ticket; // Update the ticket property
            this.ticketIssue = ticket.issue;
            this.ticketNumber = ticket.id;
            this.ticketStatus = ticket.status;
            this.clientName = ticket.clientName;
            this.clientEmail = ticket.clientEmail;
            this.clientPhone = ticket.clientPhone;
            this.ticketPriority = ticket.priority;
            this.activities =
              ticket.activity && ticket.activity.length > 0
                ? ticket.activity.flatMap((activityGroup) =>
                    activityGroup
                      ? activityGroup.map((activity: string) => ({
                          activity,
                          readOnly: true,
                        }))
                      : []
                  )
                : [{ activity: '', readOnly: false }];
            this.isLoadingData = false;
          },
          (error) => {
            console.error('Error:', error);
            this.isLoadingData = false;
          }
        );
      }
    });
  }

  transferTicket(): void {
    const assignedUser = this.users.find(
      (user) => user.id === this.assignedUser
    );
    this.ticketsService
      .updateTicket(this.ticket.id, { assigned: assignedUser?.id }) // Fix: Pass the id property of assignedUser
      .subscribe(
        (response) => {
          console.log('Ticket transferred successfully:', response);
        },
        (error) => {
          console.error('Error:', error);
        }
      );
  }

  toggleIssueEdit() {
    this.issueReadOnly = !this.issueReadOnly;
  }

  toggleActivityEdit(index: number) {
    this.activities[index].readOnly = !this.activities[index].readOnly;
  }

  deleteActivity(index: number) {
    this.activities.splice(index, 1);
  }

  submitActivity(index: number) {
    console.log('Submit activity:', index);
    const updatedActivity = this.activities[index].activity;
    this.activities[index].readOnly = true;

    // Update the activity in the current ticket
    const updatedActivities = this.activities.map((activity, i) =>
      i === index ? updatedActivity : activity.activity
    );

    // Call the updateTicket method with the ticket id and the updated activity
    this.ticketsService
      .updateTicket(this.ticket.id, { activity: updatedActivities })
      .subscribe(
        (response) => {
          console.log('Ticket updated successfully:', response);
        },
        (error) => {
          console.error('Error:', error);
        }
      );
  }

  submitIssue() {
    console.log('Submit issue');
    // Call the updateTicket method with the ticket id and the updated issue

    this.ticketsService
      .updateTicket(this.ticket.id, { issue: this.ticketIssue })
      .subscribe(
        (response) => {
          console.log('Ticket updated successfully:', response);
          this.toggleIssueEdit(); // Switch back to read-only mode
        },
        (error) => {
          console.error('Error:', error);
        }
      );
  }

  changeStatus() {
    console.log('Change status');
    // Call the updateTicket method with the ticket id and the updated status
    this.ticketsService
      .updateTicket(this.ticket.id, { status: this.ticketStatus })
      .subscribe(
        (response) => {
          console.log('Ticket status updated successfully:', response);
        },
        (error) => {
          console.error('Error:', error);
        }
      );
  }

  addActivity() {
    this.activities.push({ activity: '', readOnly: false });
  }
}
