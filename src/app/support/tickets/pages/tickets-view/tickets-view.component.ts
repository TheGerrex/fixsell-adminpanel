import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Ticket, Status, Activity } from 'src/app/support/interfaces/tickets.interface';
import { TicketsService } from 'src/app/support/services/tickets.service';
import { Priority } from 'src/app/support/interfaces/tickets.interface';
import { User } from 'src/app/auth/interfaces';
import { UsersService } from 'src/app/users/services/users.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ActivityService } from 'src/app/support/services/activity.service';

@Component({
  selector: 'app-tickets-view',
  templateUrl: './tickets-view.component.html',
  styleUrls: ['./tickets-view.component.scss'],
})
export class TicketsViewComponent implements OnInit {
  constructor(
    private ticketsService: TicketsService,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private toastService: ToastService,
    private activityService: ActivityService,
  ) {
    this.ticket = {} as Ticket;    
  }
  ticket: Ticket;
  ticketIssue = '';
  activities: Activity[] = [];
  issueReadOnly = true;
  clientReadOnly = true;
  isLoadingData = true;
  ticketNumber = 0;
  clientName = '';
  clientEmail = '';
  clientPhone = '';
  clientPhoneMask = '';
  ticketPriority = '';
  clientAddress = '';
  assignedUser: string = ''; // Initialize the 'assignedUser' property
  assignee: string = ''; // Initialize the 'assignee' property
  users: User[] = [];
  currentUser: User | null = null;
  newActivityText: string = '';
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

  priorityOptions = [
    { value: Priority.LOW, label: 'Bajo' },
    { value: Priority.MEDIUM, label: 'Medio' },
    { value: Priority.HIGH, label: 'Alto' },
  ];

  priorityTranslations: { [key in Priority]: string } = {
    [Priority.LOW]: 'Bajo',
    [Priority.MEDIUM]: 'Medio',
    [Priority.HIGH]: 'Alto',
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

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const ticketId = params.get('id');
      if (ticketId !== null) {
        this.getTicketIssue(ticketId);
      }
    });
    this.getUsers();
    this.getCurrentUser();
   
    console.log("Activites:", this.activities);
  }

  convertToLocalDate(dateString: string): string {
    console.log('Date string:', dateString);
    const date = new Date(dateString);
    console.log('Date:', date);
    if (isNaN(date.getTime())) {
      // The date string is not valid
      console.log('Invalid date string');
      return dateString;
    } else {
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return localDate.toISOString();
    }
  }

  getUsers() {
    const token = localStorage.getItem('token');
    if (token !== null) {
      this.usersService.getUsers(token).subscribe((users: User[]) => {
        this.users = users;
      });
    }
  }

  getCurrentUser() {
    this.currentUser = this.usersService.getCurrentUser();
    console.log('Current user:', this.currentUser);
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
      this.clientAddress = ticket.clientAddress;
      this.clientEmail = ticket.clientEmail;
      this.clientPhone = ticket.clientPhone;
      this.ticketPriority = ticket.priority;
      this.assignedUser = ticket.assigned && ticket.assigned.name ? ticket.assigned.name : '';
      this.assignee = ticket.assignee && ticket.assignee.name ? ticket.assignee.name : '';
      this.ticket.createdDate = this.convertToLocalDate(this.ticket.createdDate);
      this.ticket.updatedDate = this.convertToLocalDate(this.ticket.updatedDate);
      this.activities = this.ticket.activities
      console.log('Activities:', this.activities);
    });
  }

  transferTicket(): void {
    const selectedUser = this.users.find(
      (user) => user.name === this.ticket.assigned.name
    );
    if (!selectedUser) {
      console.error('Selected user not found');
      return;
    }
    const selectedUserId = selectedUser.id;

    // Check if the selected user is different from the current assigned user
    if (this.ticket.assigned && this.ticket.assigned.id === selectedUserId) {
      console.log('The selected user is already the assigned user');
      return;
    }

    this.ticketsService
      .updateTicket(this.ticket.id, { assigned: selectedUserId }) // Pass the selected user ID
      .subscribe(
        (response) => {
          console.log('Ticket transferred successfully:', response);
          this.ticket.assigned.name = selectedUser.name; // Update the assignedUser property with the username
          this.toastService.showSuccess(
            'Ticket transferred successfully',
            'OK'
          );
        },
        (error) => {
          console.error('Error:', error);
          this.toastService.showError(
            'Error transferring ticket',
            error.message
          );
        }
      );
  }

  toggleIssueEdit() {
    this.issueReadOnly = !this.issueReadOnly;
  }

  toggleClientEdit() {
    this.clientReadOnly = !this.clientReadOnly;
  }

  // toggleActivityEdit(index: number) {
  //   this.activities[index].readOnly = !this.activities[index].readOnly;
  // }

  addActivity() {
    console.log("Current User:", this.currentUser);
    const newActivity: Omit<Activity, 'id'> = { text: this.newActivityText, addedBy: this.currentUser ? this.currentUser.id : undefined };
    console.log('New activity:', newActivity);
    this.activityService.createActivity(newActivity).subscribe(
      (activity) => {
        console.log('Activity created successfully:', activity);
        this.activities.push(activity);
        // this.ticket.activities.push(activity);
        this.ticketsService.updateTicket(this.ticket.id, {activities: this.activities}).subscribe(
        (updatedTicket) => {
          console.log('Ticket updated successfully:', updatedTicket);
          this.ticket = updatedTicket;
        },
        (error) => {
          console.error('Error updating ticket:', error);
        }
      );

      },
      (error) => {
        console.error('Error creando actividad:', error);
      }
    );
  }

  // deleteActivity(index: number) {
  //   // Remove the activity from the local array
  //   this.activities.splice(index, 1);

  //   // Prepare the updated activities for the updateTicket call
  //   const updatedActivities = this.activities.map(
  //     (activity) => activity.activity
  //   );

  //   // Call the updateTicket method with the ticket id and the updated activities
  //   this.ticketsService
  //     .updateTicket(this.ticket.id, { activity: updatedActivities })
  //     .subscribe(
  //       (response) => {
  //         console.log('Ticket updated successfully:', response);
  //         this.toastService.showSuccess(
  //           'Activity deleted and ticket updated successfully',
  //           'OK'
  //         );
  //       },
  //       (error) => {
  //         console.error('Error:', error);
  //         this.toastService.showError(
  //           'Error updating ticket after deleting activity',
  //           error.message
  //         );
  //       }
  //     );
  // }

  // submitActivity(index: number) {
  //   console.log('Submit activity:', index);
  //   const updatedActivity = this.activities[index].activity;
  //   this.activities[index].readOnly = true;

  //   // Update the activity in the current ticket
  //   const updatedActivities = this.activities.map((activity, i) =>
  //     i === index ? updatedActivity : activity.activity
  //   );

  //   // Call the updateTicket method with the ticket id and the updated activity
  //   this.ticketsService
  //     .updateTicket(this.ticket.id, { activity: updatedActivities })
  //     .subscribe(
  //       (response) => {
  //         console.log('Ticket updated successfully:', response);
  //         this.toastService.showSuccess('Ticket updated successfully', 'OK');
  //       },
  //       (error) => {
  //         console.error('Error:', error);
  //         this.toastService.showError('Error updating ticket', error.message);
  //       }
  //     );
  // }

  submitIssue() {
    console.log('Submit issue');
    // Call the updateTicket method with the ticket id and the updated issue
    this.ticketsService
      .updateTicket(this.ticket.id, { issue: this.ticketIssue })
      .subscribe(
        (response) => {
          console.log('Ticket updated successfully:', response);
          this.toastService.showSuccess('Ticket updated successfully', 'OK');
          this.toggleIssueEdit(); // Switch back to read-only mode
        },
        (error) => {
          console.error('Error:', error);
          this.toastService.showError('Error updating ticket', error.message);
        }
      );
  }

  changeStatus() {
    console.log('Cambio de Estatus');
    // Call the updateTicket method with the ticket id and the updated status
    this.ticketsService
      .updateTicket(this.ticket.id, { status: this.ticketStatus })
      .subscribe(
        (response) => {
          this.ticket.status = this.ticketStatus;
          this.toastService.showSuccess(
            'Estado del ticket actualizado correctamente',
            'OK'
          );
        },
        (error) => {
          this.toastService.showError(
            'Error al actualizar el estado del ticket',
            error.message
          );
        }
      );
  }

  changePriority() {
    console.log('Change priority');
    // Call the updateTicket method with the ticket id and the updated priority
    this.ticketsService
      .updateTicket(this.ticket.id, { priority: this.ticketPriority as Priority })
      .subscribe(
        (response) => {
          console.log('Ticket updated successfully:', response);
          this.ticket.priority = this.ticketPriority as Priority;
          this.toastService.showSuccess(
            'Prioridad del ticket actualizado correctamente',
            'OK'
          );
        },
        (error) => {
          this.toastService.showError(
            'Error al actualizar la prioridad del ticket',
            error.message
          );
        }
      );
  }

  changeClientData() {
  console.log('Change client data');
  // Call the updateTicket method with the ticket id and the updated client data
  this.ticketsService
    .updateTicket(this.ticket.id, {
      clientName: this.clientName,
      clientEmail: this.clientEmail,
      clientPhone: this.clientPhone,
      clientAddress: this.clientAddress
    })
    .subscribe(
      (response) => {
        console.log('Ticket client data updated successfully:', response);
        // Update the ticket object with the response from the server
        this.ticket.clientName = this.clientName;
        this.ticket.clientEmail = this.clientEmail;
        this.ticket.clientPhone = this.clientPhone;
        this.ticket.clientAddress = this.clientAddress;
        this.clientReadOnly = true; // Switch back to read-only mode
        this.toastService.showSuccess(
          'Datos del cliente actualizados correctamente',
          'OK'
        );
      },
      (error) => {
        console.error('Error:', error);
        this.toastService.showError(
          'Error al actualizar los datos del cliente',
          error.message
        );
      }
    );
}
}
