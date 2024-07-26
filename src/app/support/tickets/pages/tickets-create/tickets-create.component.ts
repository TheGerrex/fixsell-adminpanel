import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
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
    { value: 'on-site', viewValue: 'Sitio' }
  ];

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

    console.log("defaultStartTime",this.defaultStartTime)
    console.log("defaultEndTime",this.defaultEndTime)
    console.log("defaultStartDate",this.defaultStartDate)
    console.log("defaultEndDate",this.defaultEndDate)
    console.log("Form Control: appointmentStartTime",this.createTicketForm.get('appointmentStartTime')?.value)
    console.log("Form Control: appointmentEndTime",this.createTicketForm.get('appointmentEndTime')?.value)
    if (this.token) {
      this.usersService.getUsers(this.token).subscribe((users) => {
        this.users = users;
      });
    }

    // set assignee value
    const currentUser = JSON.parse(
      localStorage.getItem('currentUser') ?? 'null'
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

  getActualDefaultDate(): void {
    const currentDate = new Date();
    // const timeZone = 'America/Mexico_City';
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.zonedDate = toZonedTime(currentDate, timeZone);
    console.log("zonedDate",this.zonedDate);

    let hours = this.zonedDate.getHours();
    let minutes = this.zonedDate.getMinutes();
    
    // round up to the next 30-minute interval
    minutes = Math.ceil(minutes / 30) * 30;
    
    // if minutes is 60, set it to 0 and increment the hour
    if (minutes === 60) {
      minutes = 0;
      hours++;
    }
    this.defaultStartDate = format(this.zonedDate, 'yyyy-MM-dd');
    this.defaultEndDate = format(this.zonedDate, 'yyyy-MM-dd');
    this.defaultStartTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    this.defaultEndTime = `${(hours+1).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  initializeForm() {
    this.createTicketForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      clientName: ['', Validators.required],
      clientAddress: [''],
      clientEmail: ['', [Validators.required, Validators.pattern(this.validatorsService.emailPattern)]],
      clientPhone: ['', [Validators.required, Validators.pattern(this.validatorsService.numberPattern)]],
      assigned: ['', Validators.required],
      assignee: ['', Validators.required],
      issue: ['', Validators.required],
      priority: ['', Validators.required],
      appointmentStartTime: [this.defaultStartDate],
      appointmentEndTime: [{ value: this.defaultEndDate, disabled: true }],
      startTime: [this.defaultStartTime],
      endTime: [this.defaultEndTime],
      status: ['open'],
    });
    this.createTicketForm.get('appointmentStartTime')?.valueChanges.pipe(debounceTime(1000)) // delay of 1 second
      .subscribe((value: string) => {
        // Try to parse the string into a Date object
        const date = this.zonedDate;
        if (!isNaN(date.getTime())) {
          // If the date is valid, use it to calculate the end date
          this.calculateEndDate(date);
        } else {
          // If the date is not valid, set a validation error on the form control
          this.createTicketForm.get('appointmentStartTime')
            ?.setErrors({ incorrect: true });
        }
      });
    this.createTicketForm.get('startTime')?.valueChanges.pipe(debounceTime(1000)) // delay of 1 second
      .subscribe((value: string) => {
        // Try to parse the string into a Date object
        const date = this.zonedDate;
        if (!isNaN(date.getTime())) {
          // If the date is valid, use it to calculate the end date
          this.calculateEndDate(date);
        } else {
          // If the date is not valid, set a validation error on the form control
          this.createTicketForm.get('startTime')
            ?.setErrors({ incorrect: true });
        }
      });
    this.createTicketForm.get('endTime')?.valueChanges.pipe(debounceTime(1000)) // delay of 1 second
      .subscribe((value: string) => {
        // Try to parse the string into a Date object
        const date = this.zonedDate;
        if (!isNaN(date.getTime())) {
          // If the date is valid, use it to calculate the end date
          this.calculateEndDate(date);
        } else {
          // If the date is not valid, set a validation error on the form control
          this.createTicketForm.get('endTime')
            ?.setErrors({ incorrect: true });
        }
      });
  }

  updateValidators(type: string) {
    const controlsToUpdate = [
      'clientAddress',
    ];

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
        ?.setValidators([
          Validators.required,
        ]);
      this.createTicketForm
        .get('endTime')
        ?.setValidators([
          Validators.required,
        ]);
      this.createTicketForm
        .get('clientAddress')
        ?.setValidators(Validators.required);

      controlsToUpdate.forEach((controlName) => {
        this.createTicketForm.get(controlName)?.updateValueAndValidity();
      });
    }
  }

  calculateEndDate(startDate?: Date) {
    // If no startDate is provided, use the current form value
    if (!startDate) {
      const value = this.createTicketForm.get('appointmentStartTime')?.value;
      startDate = new Date(value);
    }

    const startTimeControl = this.createTicketForm.get('startTime');
    const endTimeControl = this.createTicketForm.get('endTime');

    if (startDate && startTimeControl && endTimeControl) {
      const startTime = startTimeControl.value;
      const endTime = endTimeControl.value;

      if ( startTime !== null && endTime !== null) {
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

        console.log("Fecha de inicio", startDate);
        console.log("Fecha de terminacion", endDate);
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
    if (this.createTicketForm.valid) {
      const formData = this.createTicketForm.getRawValue(); // getRawValue includes disabled controls
      let ticket = {
        ...formData // use correct form control name
      };
      
      // Remove startTime and endTime from ticket
      delete ticket.startTime;
      delete ticket.endTime;

      this.ticketService.createTicket(ticket).subscribe(
        (response) => {
          // handle successful response
          console.log('submitting form', ticket);
          this.toastService.showSuccess(
            'Ticket creado con éxito',
            'Success'
          );
          this.router.navigate(['/support/tickets']);
        },
        (error) => {
          // handle error response
          this.toastService.showError(
            'Error creando ticket',
            error.error.message
          );
          this.isSubmitting = false;
        }
      );
    } else {
      this.toastService.showError(
        'Porfavor completa todos los campos requeridos',
        'Error'
      );
      this.isSubmitting = false;
    }
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.createTicketForm, field);
  }

  getFieldError(field: string): string | null {
    if (!this.createTicketForm.controls[field]) return null;

    const errors = this.createTicketForm.controls[field].errors || {};

    console.log(errors);

    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido';
        case 'pattern':
          return 'Este campo esta en formato incorrecto';
        case 'maxlength':
          return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
        case 'matDatepickerParse': // Add this case
          return 'Fecha inválida';
        default:
          return 'Error desconocido';
      }
    }
    return null;
  }

  openDatepicker() {
    this.datepicker.open();
  }
}
