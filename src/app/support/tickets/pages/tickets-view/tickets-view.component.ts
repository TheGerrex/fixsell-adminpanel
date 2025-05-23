import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Ticket,
  Status,
  Activity,
} from 'src/app/support/interfaces/tickets.interface';
import { TicketsService } from 'src/app/support/services/tickets.service';
import { Priority } from 'src/app/support/interfaces/tickets.interface';
import { User } from 'src/app/users/interfaces/users.interface';
import { UsersService } from 'src/app/users/services/users.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ActivityService } from 'src/app/support/services/activity.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  assignedUser: User | null = null;
  assignee: User | null = null;
  users: User[] = [];
  currentUser: User | null = null;

  // newActivityText = new FormControl('');
  newActivityText: string = '';
  newActivity: boolean = false;
  activityReadOnly = true;
  isEditing: boolean = false;
  editingIndex: number | null = null;

  isSubmittingActivity = false;

  // Add statusOptions and ticketStatus
  statusOptions = [
    { value: Status.OPEN, label: 'Abierto' },
    { value: Status.IN_PROGRESS, label: 'En progreso' },
    { value: Status.WITHOUT_RESOLUTION, label: 'Sin resolución' },
    { value: Status.COMPLETED, label: 'Completado' },
  ];
  ticketStatus = Status.OPEN; // Default status
  timeValues: { value: string; display: string }[] = [];

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
    this.initializeTimeValues();
  }

  private adjustDate(date: Date): string {
    const dateObj = new Date(date);
    const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(dateObj.getTime() - userTimezoneOffset);

    return format(adjustedDate, 'yyyy-MM-dd');
  }

  private initializeTimeValues(): void {
    // Populate timeValues with 24-hour time values in 15-minute increments
    this.timeValues = []; // Ensure timeValues is initialized as an empty array

    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 15) {
        let hour = i;
        let displayHour = i;
        let amPm = 'am';

        if (displayHour >= 12) {
          amPm = 'pm';
          if (displayHour > 12) displayHour -= 12;
        } else if (displayHour === 0) {
          displayHour = 12;
        }

        const hourString = hour < 10 ? `0${hour}` : `${hour}`;
        const minuteString = j < 10 ? `0${j}` : `${j}`;
        const displayHourString =
          displayHour < 10 ? `${displayHour}` : `${displayHour}`;
        const displayMinuteString = minuteString;

        this.timeValues.push({
          value: `${hourString}:${minuteString}`,
          display: `${displayHourString}:${displayMinuteString} ${amPm}`,
        });
      }
    }
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
        this.adjustDate(this.ticketAppointmentDateStart) || '',
        Validators.required,
      ],
      dateEnd: [
        format(this.adjustDate(this.ticketAppointmentDateEnd), 'yyyy-MM-dd') ||
          '',
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
      this.assignedUser = ticket.assigned || null;
      this.assignee = ticket.assignee || null;
      this.ticket.createdDate = new Date(this.ticket.createdDate);
      this.ticket.updatedDate = new Date(this.ticket.updatedDate);
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

    // Check if the selected user is different from the current assigned user
    if (this.ticket.assigned && this.ticket.assigned.id === selectedUser.id) {
      console.log('The selected user is already the assigned user');
      return;
    }

    // Just send the user ID as a string
    const updatePayload = {
      assigned: selectedUser.id,
    };

    this.ticketsService.updateTicket(this.ticket.id, updatePayload).subscribe(
      (response) => {
        console.log('Ticket transferred successfully:', response);

        // Update the local ticket's assigned user with the full user object
        this.ticket.assigned = selectedUser;

        this.toastService.showSuccess('Ticket transferred successfully', 'OK');
      },
      (error) => {
        console.error('Error transferring ticket:', error);
        this.toastService.showError('Error transferring ticket', error.message);
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

    this.isSubmittingActivity = true; // Set loading state to true when submitting

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
        this.isSubmittingActivity = false; // Reset loading state on success
        this.toastService.showSuccess(
          'Actividad del ticket agregado correctamente',
          'OK',
        );
        this.activities.push(activity);
        this.newActivity = false;
        this.activityForm.reset();
      },
      error: (error: any) => {
        this.isSubmittingActivity = false; // Reset loading state on error
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
    this.ticketsService
      .updateTicket(this.ticket.id, { status: this.ticketStatus })
      .subscribe(
        (response) => {
          this.ticket.status = this.ticketStatus;
          this.toastService.showSuccess(
            'Estado del ticket actualizado correctamente',
            'OK',
          );

          // If ticket is completed, send rating prompt
          if (this.ticket.status === 'completed') {
            console.log('Ticket completed, sending rating prompt');
            // Make sure to include both phone and ticket ID
            if (this.clientPhone) {
              this.ticketsService
                .sendRatingPrompt(this.clientPhone, this.ticket.id.toString())
                .subscribe(
                  () => {
                    console.log('Rating prompt sent successfully');
                  },
                  (error) => {
                    console.error('Error sending rating prompt:', error);
                    this.toastService.showError(
                      'Error al enviar la solicitud de calificación',
                      error.message,
                    );
                  },
                );
            } else {
              console.warn('No client phone available to send rating prompt');
            }
          }
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
