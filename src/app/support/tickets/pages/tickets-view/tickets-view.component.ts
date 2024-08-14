import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Ticket,
  Status,
  Activity,
} from 'src/app/support/interfaces/tickets.interface';
import { TicketsService } from 'src/app/support/services/tickets.service';
import { Priority } from 'src/app/support/interfaces/tickets.interface';
import { User } from 'src/app/auth/interfaces';
import { UsersService } from 'src/app/users/services/users.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ActivityService } from 'src/app/support/services/activity.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { format } from 'date-fns';

@Component({
  selector: 'app-tickets-view',
  templateUrl: './tickets-view.component.html',
  styleUrls: ['./tickets-view.component.scss'],
})
export class TicketsViewComponent implements OnInit {
  ticket: Ticket;
  ticketIssue = '';
  activities: Activity[] = [];
  issueReadOnly = true;
  clientReadOnly = true;
  eventReadOnly = true;
  isLoadingData = true;
  ticketNumber = 0;
  ticketTitle = '';
  ticketType = '';
  ticketAppointmentDateStart!: Date;
  ticketAppointmentDateEnd!: Date;
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

  // newActivityText = new FormControl('');
  newActivityText: string = '';
  newActivity: boolean = false;
  activityReadOnly = true;
  isEditing: boolean = false;
  editingIndex: number | null = null;

  // Add statusOptions and ticketStatus
  statusOptions = [
    { value: Status.OPEN, label: 'Abierto' },
    { value: Status.IN_PROGRESS, label: 'En progreso' },
    { value: Status.WITHOUT_RESOLUTION, label: 'Sin resolución' },
    { value: Status.COMPLETED, label: 'Completado' },
  ];
  ticketStatus = Status.OPEN; // Default status

  clientForm!: FormGroup;
  eventForm!: FormGroup;
  issueForm!: FormGroup;
  activityForm!: FormGroup;

  types = [
    { value: 'remote', viewValue: 'Remoto' },
    { value: 'on-site', viewValue: 'Sitio' },
  ];

  @ViewChild('ticketDatepicker') datepicker!: MatDatepicker<Date>;

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
    { value: Priority.LOW, label: 'Baja' },
    { value: Priority.MEDIUM, label: 'Media' },
    { value: Priority.HIGH, label: 'Alta' },
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

  constructor(
    private ticketsService: TicketsService,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private toastService: ToastService,
    private activityService: ActivityService,
    private fb: FormBuilder,
    private validatorsService: ValidatorsService,
  ) {
    this.ticket = {} as Ticket;
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
  }

  initializeAllForms() {
    this.initializeClientForm();
    this.initializeIssueForm();
    this.initializeEventForm();
    this.initializeActivityForm();
  }

  initializeClientForm() {
    this.clientForm = this.fb.group({
      name: [this.clientName, Validators.required],
      email: [
        this.clientEmail,
        [
          Validators.required,
          Validators.pattern(this.validatorsService.emailPattern),
        ],
      ],
      phone: [
        this.clientPhone,
        [
          Validators.required,
          Validators.pattern(this.validatorsService.numberPattern),
        ],
      ],
      address: [this.clientAddress],
    });
  }

  initializeIssueForm() {
    this.issueForm = this.fb.group({
      issue: [this.ticketIssue, Validators.required],
    });
  }

  initializeEventForm() {
    this.eventForm = this.fb.group({
      title: [this.ticketTitle || '', Validators.required],
      type: [this.ticketType || '', Validators.required],
      dateStart: [
        format(this.ticketAppointmentDateStart, 'yyyy-MM-dd') || '',
        Validators.required,
      ],
      dateEnd: [
        format(this.ticketAppointmentDateEnd, 'yyyy-MM-dd') || '',
        Validators.required,
      ],
      timeStart: [
        format(this.ticketAppointmentDateStart, 'HH:mm') || '',
        Validators.required,
      ],
      timeEnd: [
        format(this.ticketAppointmentDateEnd, 'HH:mm') || '',
        Validators.required,
      ],
    });
    console.log('Event form:', this.eventForm);
  }

  initializeActivityForm() {
    this.activityForm = this.fb.group({
      text: ['', Validators.required],
    });
    console.log('Event form:', this.eventForm);
  }

  getTicketIssue(ticketId: string) {
    this.ticketsService.getTicketById(ticketId).subscribe((ticket: Ticket) => {
      console.log('Ticket data:', ticket); // Log the ticket data
      this.isLoadingData = false;
      this.ticket = ticket; // Update the ticket property
      this.ticketTitle = ticket.title;
      this.ticketType = ticket.type;
      this.ticketAppointmentDateStart = this.ticket.appointmentStartTime;
      this.ticketAppointmentDateEnd = this.ticket.appointmentEndTime;
      this.ticketIssue = ticket.issue;
      this.ticketNumber = ticket.id; // Set the ticket number
      this.ticketStatus = ticket.status; // Set the ticket status
      this.clientName = ticket.clientName;
      this.clientAddress = ticket.clientAddress;
      this.clientEmail = ticket.clientEmail;
      this.clientPhone = ticket.clientPhone;
      this.ticketPriority = ticket.priority;
      this.assignedUser =
        ticket.assigned && ticket.assigned.name ? ticket.assigned.name : '';
      this.assignee =
        ticket.assignee && ticket.assignee.name ? ticket.assignee.name : '';
      this.ticket.createdDate = this.convertToLocalDate(
        this.ticket.createdDate,
      );
      this.ticket.updatedDate = this.convertToLocalDate(
        this.ticket.updatedDate,
      );
      this.activities = this.ticket.activities;
      console.log('Activities:', this.activities);
      // Reinitialize forms with the fetched ticket data
      this.initializeAllForms();
    });
  }

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

  convertToLocalDate(dateString: Date): Date {
    console.log('Date string:', dateString);
    const date = new Date(dateString);
    console.log('Date:', date);
    if (isNaN(date.getTime())) {
      // The date string is not valid
      console.log('Invalid date string');
      return dateString;
    } else {
      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000,
      );
      return localDate;
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

  transferTicket(): void {
    const selectedUser = this.users.find(
      (user) => user.name === this.ticket.assigned.name,
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
            'OK',
          );
        },
        (error) => {
          console.error('Error:', error);
          this.toastService.showError(
            'Error transferring ticket',
            error.message,
          );
        },
      );
  }

  toggleIssueEdit() {
    this.issueReadOnly = !this.issueReadOnly;
  }

  toggleEventEdit() {
    this.eventReadOnly = !this.eventReadOnly;
  }

  toggleClientEdit() {
    this.clientReadOnly = !this.clientReadOnly;
  }

  toggleNewActivity() {
    this.newActivity = !this.newActivity;
  }
  cancelNewActivity() {
    this.newActivity = false;
  }

  addActivity() {
    if (this.activityForm.invalid) {
      console.error('Invalid form data');
      return;
    }
    const newActivity: Omit<Activity, 'id'> = {
      text: this.activityForm.value.text,
      addedBy: this.currentUser ? this.currentUser : undefined,
      ticket: this.ticket.id,
    };
    console.log('New activity:', newActivity);
    // Log current activity array:
    console.log('Activities:', this.activities);

    // Initialize activities as an empty array if it is null or undefined
    if (!this.activities) {
      this.activities = [];
    }

    const createActivityObserver = {
      next: (activity: Activity) => {
        this.toastService.showSuccess(
          'Actividad del ticket agregado correctamente',
          'OK',
        );
        this.activities.push(activity);
        this.newActivity = false;
        this.activityForm.reset();
      },
      error: (error: any) => {
        this.toastService.showError('Error creando actividad', error);
      },
    };

    this.activityService
      .createActivity(newActivity)
      .subscribe(createActivityObserver);
  }

  updateActivity(index: number) {
    const activity = this.activities[index];
    const { id, ...activityWithoutId } = activity;
    activityWithoutId.ticket = this.ticket.id;
    activityWithoutId.addedBy = this.currentUser ? this.currentUser : undefined;
    if (activity.id !== undefined) {
      console.log('Updating activity:', activityWithoutId);
      this.activityService
        .updateActivity(activity.id, activityWithoutId)
        .subscribe(
          (updatedActivity) => {
            this.toastService.showSuccess(
              'Actividad del ticket actualizado correctamente',
              'OK',
            );
            this.activities[index] = updatedActivity;
            this.editingIndex = null;
          },
          (error) => {
            this.toastService.showError(
              'Error actualizadando la actividad del ticket',
              error,
            );
          },
        );
    } else {
      console.error('El ID de la actividad no está definido');
    }
  }

  deleteActivity(index: number) {
    const activity = this.activities[index];
    if (activity.id !== undefined) {
      console.log('Deleting activity:', activity.id);
      this.activityService.deleteActivity(activity.id).subscribe(
        () => {
          this.toastService.showSuccess(
            'Actividad eliminada correctamente',
            'OK',
          );
          this.activities.splice(index, 1);
        },
        (error) => {
          console.error('Error al borrar actividad:', error);
        },
      );
    } else {
      console.error('El ID de la actividad no está definido');
    }
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
            'OK',
          );
        },
        (error) => {
          this.toastService.showError(
            'Error al actualizar el estado del ticket',
            error.message,
          );
        },
      );
  }

  changePriority() {
    console.log('Change priority');
    // Call the updateTicket method with the ticket id and the updated priority
    this.ticketsService
      .updateTicket(this.ticket.id, {
        priority: this.ticketPriority as Priority,
      })
      .subscribe(
        (response) => {
          console.log('Ticket updated successfully:', response);
          this.ticket.priority = this.ticketPriority as Priority;
          this.toastService.showSuccess(
            'Prioridad del ticket actualizado correctamente',
            'OK',
          );
        },
        (error) => {
          this.toastService.showError(
            'Error al actualizar la prioridad del ticket',
            error.message,
          );
        },
      );
  }

  onSaveIssue() {
    if (this.issueForm.invalid) {
      this.toastService.showError(
        'Datos de formulario no válidos',
        'Por favor, corrija los errores del formulario.',
      );
      return;
    }
    const issueData = this.issueForm.value;
    const updatedTicketData = {
      issue: issueData.issue,
      // Add other fields as necessary
    };
    this.ticketIssue = issueData.issue;
    console.log('Issue Data:', issueData);
    this.ticketsService
      .updateTicket(this.ticket.id, updatedTicketData)
      .subscribe(
        (response) => {
          this.toastService.showSuccess(
            'Problema del ticket actualizado correctamente',
            'OK',
          );
          this.issueReadOnly = true;
        },
        (error) => {
          console.error('Error:', error);
          this.toastService.showError(
            'Error al actualizar el problema del ticket',
            error.message,
          );
        },
      );
  }

  onSaveEvent(): void {
    if (this.eventForm.invalid) {
      this.toastService.showError(
        'Datos de formulario no válidos',
        'Por favor, corrija los errores del formulario.',
      );
      return;
    }
    const eventData = this.eventForm.value;
    const updatedTicketData = {
      title: eventData.title,
      type: eventData.type,
      appointmentStartTime: this.calculateStartDate(
        eventData.dateStart,
        eventData.timeStart,
      ),
      appointmentEndTime: this.calculateEndDate(
        eventData.dateStart,
        eventData.timeEnd,
      ),
      // Add other fields as necessary
    };

    this.ticketTitle = eventData.title;
    this.ticketType = eventData.type;
    this.ticketAppointmentDateStart = this.calculateStartDate(
      eventData.dateStart,
      eventData.timeStart,
    );
    this.ticketAppointmentDateEnd = this.calculateEndDate(
      eventData.dateStart,
      eventData.timeEnd,
    );

    console.log('Event Data:', eventData);
    // Call the updateTicket method with the ticket id and the updated issue
    this.ticketsService
      .updateTicket(this.ticket.id, updatedTicketData)
      .subscribe(
        (response) => {
          this.toastService.showSuccess(
            'Evento del ticket actualizado correctamente',
            'OK',
          );
          this.eventReadOnly = true;
        },
        (error) => {
          console.error('Error:', error);
          this.toastService.showError(
            'Error al actualizar el evento del ticket',
            error.message,
          );
        },
      );
  }

  onSaveClient() {
    if (this.clientForm.invalid) {
      this.toastService.showError(
        'Datos de formulario no válidos',
        'Por favor, corrija los errores del formulario.',
      );
      return;
    }
    const clientData = this.clientForm.value;
    const updatedTicketData = {
      clientName: clientData.name,
      clientEmail: clientData.email,
      clientPhone: clientData.phone,
      clientAddress: clientData.address,
      // Add other fields as necessary
    };
    console.log('Client Data:', clientData);
    this.clientName = clientData.name;
    this.clientEmail = clientData.email;
    this.clientPhone = clientData.phone;
    this.clientAddress = clientData.address;

    this.ticketsService
      .updateTicket(this.ticket.id, updatedTicketData)
      .subscribe(
        (response) => {
          console.log('Ticket client data updated successfully:', response);
          this.clientReadOnly = true;
          this.toastService.showSuccess(
            'Datos del cliente actualizados correctamente',
            'OK',
          );
        },
        (error) => {
          console.error('Error:', error);
          this.toastService.showError(
            'Error al actualizar los datos del cliente',
            error.message,
          );
        },
      );
  }

  calculateStartDate(dateStart: Date, timeStart: string): Date {
    const [hours, minutes] = timeStart.split(':').map(Number);

    // Create a new Date object based on dateStart and set the hours and minutes
    const startDate = new Date(dateStart);
    startDate.setHours(hours, minutes);

    return startDate;
  }

  calculateEndDate(dateEnd: Date, timeEnd: string): Date {
    const [hours, minutes] = timeEnd.split(':').map(Number);

    // Create a new Date object based on dateStart and set the hours and minutes
    const endDate = new Date(dateEnd);
    endDate.setHours(hours, minutes);

    return endDate;
  }

  isValidFieldEventForm(field: string): boolean | null {
    return this.validatorsService.isValidField(this.eventForm, field);
  }

  isValidFieldClientForm(field: string): boolean | null {
    return this.validatorsService.isValidField(this.clientForm, field);
  }

  isValidFieldIssueForm(field: string): boolean | null {
    return this.validatorsService.isValidField(this.issueForm, field);
  }

  isValidFieldActivityForm(field: string): boolean | null {
    return this.validatorsService.isValidField(this.activityForm, field);
  }

  getFieldErrorEventForm(field: string): string | null {
    return this.validatorsService.getFieldError(this.eventForm, field);
  }

  getFieldErrorClientForm(field: string): string | null {
    return this.validatorsService.getFieldError(this.clientForm, field);
  }

  getFieldErrorIssueForm(field: string): string | null {
    return this.validatorsService.getFieldError(this.issueForm, field);
  }

  getFieldErrorActivityForm(field: string): string | null {
    return this.validatorsService.getFieldError(this.activityForm, field);
  }

  openDatepicker() {
    this.datepicker.open();
  }
}
