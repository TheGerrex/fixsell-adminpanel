import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ToastService } from './../../../../shared/services/toast.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { startWith, map, switchMap, debounceTime } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {
  Ticket,
  Priority,
  Status,
} from 'src/app/support/interfaces/tickets.interface';
import { TicketsService } from 'src/app/support/services/tickets.service';
import { User } from '../../../../auth/interfaces/user.interface';
import { UsersService } from 'src/app/users/services/users.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

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
  types = ['remote', 'on-site'];
  hours = Array.from({ length: 24 }, (_, i) => i);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private ticketService: TicketsService,
    private usersService: UsersService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private validatorsService: ValidatorsService,
    private matDatepickerModule: MatDatepickerModule
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
    this.initializeForm();
    if (this.token) {
      this.usersService.getUsers(this.token).subscribe((users) => {
        ``;
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
  }

  initializeForm() {
    this.createTicketForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      clientName: ['', Validators.required],
      clientAddress: [''],
      clientEmail: ['', [Validators.required, Validators.email]],
      clientPhone: ['', Validators.required],
      assigned: ['', Validators.required],
      assignee: ['', Validators.required],
      issue: ['', Validators.required],
      priority: ['', Validators.required],
      appointmentStartTime: ['', Validators.required],
      startHour: [
        '',
        [Validators.required, Validators.min(0), Validators.max(23)],
      ],
      startMinute: [
        '',
        [Validators.required, Validators.min(0), Validators.max(59)],
      ],
      endHour: [
        '',
        [Validators.required, Validators.min(0), Validators.max(23)],
      ],
      endMinute: [
        '',
        [Validators.required, Validators.min(0), Validators.max(59)],
      ],
      appointmentEndTime: [{ value: '', disabled: true }],
      status: ['open'],
    });
    this.createTicketForm
      .get('appointmentStartTime')
      ?.valueChanges.pipe(debounceTime(1000)) // delay of 1 second
      .subscribe((value: string) => {
        // Try to parse the string into a Date object
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          // If the date is valid, use it to calculate the end date
          this.calculateEndDate(date);
        } else {
          // If the date is not valid, set a validation error on the form control
          this.createTicketForm
            .get('appointmentStartTime')
            ?.setErrors({ incorrect: true });
        }
      });

    this.createTicketForm.get('startHour')?.valueChanges.subscribe(() => {
      this.calculateEndDate();
    });

    this.createTicketForm.get('startMinute')?.valueChanges.subscribe(() => {
      this.calculateEndDate();
    });

    this.createTicketForm.get('endHour')?.valueChanges.subscribe(() => {
      this.calculateEndDate();
    });

    this.createTicketForm.get('endMinute')?.valueChanges.subscribe(() => {
      this.calculateEndDate();
    });
  }

  calculateEndDate(startDate?: Date) {
    // If no startDate is provided, use the current form value
    if (!startDate) {
      const value = this.createTicketForm.get('appointmentStartTime')?.value;
      startDate = new Date(value);
    }

    const startHourControl = this.createTicketForm.get('startHour');
    const startMinuteControl = this.createTicketForm.get('startMinute');
    const endHourControl = this.createTicketForm.get('endHour');
    const endMinuteControl = this.createTicketForm.get('endMinute');

    if (
      startDate &&
      startHourControl &&
      startMinuteControl &&
      endHourControl &&
      endMinuteControl
    ) {
      const startHour = startHourControl.value;
      const startMinute = startMinuteControl.value;
      const endHour = endHourControl.value;
      const endMinute = endMinuteControl.value;

      if (
        startHour !== null &&
        startMinute !== null &&
        endHour !== null &&
        endMinute !== null
      ) {
        startDate.setHours(startHour, startMinute);
        this.createTicketForm
          .get('appointmentStartTime')
          ?.setValue(startDate, { emitEvent: false });

        const endDate = new Date(startDate.getTime());
        endDate.setHours(endHour, endMinute);
        this.createTicketForm
          .get('appointmentEndTime')
          ?.setValue(endDate, { emitEvent: false });
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
    console.log('submitting form', this.createTicketForm.value);
    if (this.createTicketForm.valid) {
      const formData = this.createTicketForm.getRawValue(); // getRawValue includes disabled controls
      let ticket = {
        ...formData,
        startTime: formData.startTime, // use correct form control name
        appointmentEndTime: formData.appointmentEndTime, // use correct form control name
      };

      // Remove startTime and endTime from ticket
      delete ticket.startTime;
      delete ticket.endTime;

      this.ticketService.createTicket(ticket).subscribe(
        (response) => {
          // handle successful response
          this.toastService.showSuccess(
            'Ticket created successfully',
            'Success'
          );
          this.router.navigate(['/support/tickets']);
        },
        (error) => {
          // handle error response
          this.toastService.showError(
            'Error creating ticket',
            error.error.message
          );
          this.isSubmitting = false;
        }
      );
    } else {
      this.toastService.showError(
        'Please fill in all required fields',
        'Error'
      );
      this.isSubmitting = false;
    }
  }

  isValidField(field: string): boolean | null {
    // console.log(this.validatorsService.isValidField(this.createTicketForm, field))
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
}
