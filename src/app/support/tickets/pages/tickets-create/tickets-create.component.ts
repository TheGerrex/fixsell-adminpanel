import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from './../../../../shared/services/toast.service';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import {
  Ticket,
  Priority,
  Status,
} from 'src/app/support/interfaces/tickets.interface';
import { TicketsService } from 'src/app/support/services/tickets.service';
import { User } from '../../../../auth/interfaces/user.interface';
import { UsersService } from 'src/app/users/services/users.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { format, toZonedTime } from 'date-fns-tz';
@Component({
  selector: 'app-tickets-create',
  templateUrl: './tickets-create.component.html',
  styleUrl: './tickets-create.component.scss',
})
export class TicketsCreateComponent implements OnInit {
  public createTicketForm!: FormGroup;
  ticket: Ticket | null = null;
  users: User[] = [];
  isLoadingForm = false;
  isSubmitting = false;
  priorities = Object.values(Priority);
  token = localStorage.getItem('token');
  types = [
    { value: 'remote', viewValue: 'Remoto' },
    { value: 'on-site', viewValue: 'Sitio' },
  ];
  timeValues: { value: string; display: string }[] = [];

  defaultStartDate!: string;
  defaultEndDate!: string;
  defaultStartTime!: string;
  defaultEndTime!: string;
  zonedDate!: Date;

  @ViewChild('ticketDatepicker') datepicker!: MatDatepicker<Date>;

  constructor(
    private router: Router,
    private ticketService: TicketsService,
    private usersService: UsersService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private validatorsService: ValidatorsService,
  ) {}

  translatePriority(priority: Priority): string {
    switch (priority) {
      case Priority.LOW:
        return 'Bajo';
      case Priority.MEDIUM:
        return 'Medio';
      case Priority.HIGH:
        return 'Alto';
      default:
        return priority;
    }
  }

  ngOnInit(): void {
    this.getActualDefaultDate();
    this.initializeForm();
    this.initializeTimeValues();
    this.setInitialTimes();

    console.log('defaultStartTime', this.defaultStartTime);
    console.log('defaultEndTime', this.defaultEndTime);
    console.log('defaultStartDate', this.defaultStartDate);
    console.log('defaultEndDate', this.defaultEndDate);
    console.log(
      'Form Control: appointmentStartTime',
      this.createTicketForm.get('appointmentStartTime')?.value,
    );
    console.log(
      'Form Control: appointmentEndTime',
      this.createTicketForm.get('appointmentEndTime')?.value,
    );
    if (this.token) {
      this.usersService.getUsers(this.token).subscribe((users) => {
        this.users = users;
      });
    }

    // set assignee value
    const currentUser = JSON.parse(
      localStorage.getItem('currentUser') ?? 'null',
    );
    if (currentUser && currentUser.id) {
      this.createTicketForm.get('assignee')?.setValue(currentUser.id);
    }

    // Update validators based on type
    this.createTicketForm.get('type')?.valueChanges.subscribe((type) => {
      this.updateValidators(type);
    });

    // Initial call to set validators based on the default type
    this.updateValidators(this.createTicketForm.get('type')?.value);
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

  private setInitialTimes(): void {
    // Function to get the next 15-minute increment
    const getNext15Minutes = (date: Date): Date => {
      const ms = 1000 * 60 * 15; // 15 minutes in milliseconds
      return new Date(Math.ceil(date.getTime() / ms) * ms);
    };

    // Get the current time and calculate the next 15-minute increment
    const now = new Date();
    const next15Minutes = getNext15Minutes(now);

    // Format the next 15-minute increment to match the timeValues format
    const startHour = next15Minutes.getHours();
    const startMinute = next15Minutes.getMinutes();
    const startHourString = startHour < 10 ? `0${startHour}` : `${startHour}`;
    const startMinuteString =
      startMinute < 10 ? `0${startMinute}` : `${startMinute}`;
    const startTimeValue = `${startHourString}:${startMinuteString}`;

    // Calculate the end time (1 hour after the start time)
    const endTime = new Date(next15Minutes.getTime() + 60 * 60 * 1000);
    const endHour = endTime.getHours();
    const endMinute = endTime.getMinutes();
    const endHourString = endHour < 10 ? `0${endHour}` : `${endHour}`;
    const endMinuteString = endMinute < 10 ? `0${endMinute}` : `${endMinute}`;
    const endTimeValue = `${endHourString}:${endMinuteString}`;

    // Set the initial values for startTime and endTime
    this.createTicketForm.get('startTime')?.setValue(startTimeValue);
    this.createTicketForm.get('endTime')?.setValue(endTimeValue);

    // Update endTime whenever startTime changes
    this.createTicketForm.get('startTime')?.valueChanges.subscribe((value) => {
      const index = this.timeValues.findIndex((time) => time.value === value);
      if (index !== -1 && index + 4 < this.timeValues.length) {
        this.createTicketForm
          .get('endTime')
          ?.setValue(this.timeValues[index + 4].value);
      }
    });
  }

  getActualDefaultDate(): void {
    const currentDate = new Date();
    // const timeZone = 'America/Mexico_City';
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.zonedDate = toZonedTime(currentDate, timeZone);
    console.log('zonedDate', this.zonedDate);
  }

  initializeForm() {
    this.createTicketForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      clientName: ['', Validators.required],
      clientAddress: [''],
      clientEmail: [
        '',
        [
          Validators.required,
          Validators.pattern(this.validatorsService.emailPattern),
        ],
      ],
      clientPhone: [
        '',
        [
          Validators.required,
          Validators.pattern(this.validatorsService.numberPattern),
        ],
      ],
      assigned: ['', Validators.required],
      assignee: ['', Validators.required],
      issue: ['', Validators.required],
      priority: ['', Validators.required],
      appointmentStartTime: [new Date()],
      appointmentEndTime: [{ value: this.defaultEndDate, disabled: true }],
      startTime: [this.defaultStartTime],
      endTime: [this.defaultEndTime],
      status: ['open'],
    });
    // this.setInitialDate();
    this.createTicketForm
      .get('appointmentStartTime')
      ?.valueChanges.pipe(debounceTime(1000)) // delay of 1 second
      .subscribe((value: string) => {
        this.calculateEndDate();
      });
  }

  updateValidators(type: string) {
    const controlsToUpdate = ['clientAddress'];

    if (type === 'remote') {
      controlsToUpdate.forEach((controlName) => {
        const control = this.createTicketForm.get(controlName);
        control?.clearValidators();
        control?.setValue(null); // Set the value to null
        control?.updateValueAndValidity();
      });
    } else {
      this.createTicketForm
        .get('appointmentStartTime')
        ?.setValidators(Validators.required);
      this.createTicketForm
        .get('appointmentEndTime')
        ?.setValidators(Validators.required);
      this.createTicketForm
        .get('startTime')
        ?.setValidators([Validators.required]);
      this.createTicketForm
        .get('endTime')
        ?.setValidators([Validators.required]);
      this.createTicketForm
        .get('clientAddress')
        ?.setValidators(Validators.required);

      controlsToUpdate.forEach((controlName) => {
        this.createTicketForm.get(controlName)?.updateValueAndValidity();
      });
    }
  }

  calculateEndDate() {
    const startDateControl = this.createTicketForm.get('appointmentStartTime');
    const startTimeControl = this.createTicketForm.get('startTime');
    const endTimeControl = this.createTicketForm.get('endTime');

    if (startDateControl && startTimeControl && endTimeControl) {
      const startDate = startDateControl.value;
      const startTime = startTimeControl.value;
      const endTime = endTimeControl.value;
      console.log('startDate', startDate);
      console.log('startTime', startTime);
      console.log('endTime', endTime);

      if (startTime !== null && endTime !== null) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

        startDate.setHours(startHour, startMinute);
        this.createTicketForm
          .get('appointmentStartTime')
          ?.setValue(startDate, { emitEvent: false });

        endDate.setHours(endHour, endMinute);
        this.createTicketForm
          .get('appointmentEndTime')
          ?.setValue(endDate, { emitEvent: false });

        console.log('Fecha de inicio', startDate);
        console.log('Fecha de terminacion', endDate);
      }
    }
  }

  submitForm() {
    if (this.createTicketForm.invalid) {
      console.log('Invalid form');
      console.log(this.createTicketForm);
      this.createTicketForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.calculateEndDate();
    if (this.createTicketForm.valid) {
      const formData = this.createTicketForm.getRawValue(); // getRawValue includes disabled controls

      // Combine date and time values into Date objects
      const startDate = new Date(formData.appointmentStartTime);
      const [startHour, startMinute] = formData.startTime
        .split(':')
        .map(Number);
      startDate.setHours(startHour, startMinute);

      const endDate = new Date(formData.appointmentEndTime);
      const [endHour, endMinute] = formData.endTime.split(':').map(Number);
      endDate.setHours(endHour, endMinute);

      let ticket = {
        ...formData, // use correct form control name
      };

      // Remove startTime and endTime from ticket
      delete ticket.startTime;
      delete ticket.endTime;

      this.ticketService.createTicket(ticket).subscribe(
        (response) => {
          // handle successful response
          console.log('submitting form', ticket);
          this.toastService.showSuccess('Ticket creado con éxito', 'Success');
          this.router.navigate(['/support/tickets']);
        },
        (error) => {
          // handle error response
          this.toastService.showError(
            'Error creando ticket',
            error.error.message,
          );
          this.isSubmitting = false;
        },
      );
    } else {
      this.toastService.showError(
        'Porfavor completa todos los campos requeridos',
        'Error',
      );
      this.isSubmitting = false;
    }
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.createTicketForm, field);
  }

  getFieldError(field: string): string | null {
    return this.validatorsService.getFieldError(this.createTicketForm, field);
  }
}
