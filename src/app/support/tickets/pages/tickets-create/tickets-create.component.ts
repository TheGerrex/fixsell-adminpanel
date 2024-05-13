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
import { startWith, map, switchMap } from 'rxjs/operators';
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
    private validatorsService: ValidatorsService
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
      appointmentStartTime: [''],
      startTime: [''],
      duration: [''],
      appointmentEndTime: [{ value: '', disabled: true }],
      status: ['open'],
    });
    this.createTicketForm
      .get('appointmentStartTime')
      ?.valueChanges.subscribe(() => {
        this.calculateEndDate();
      });

    this.createTicketForm.get('startTime')?.valueChanges.subscribe(() => {
      this.calculateEndDate();
    });

    this.createTicketForm.get('duration')?.valueChanges.subscribe(() => {
      this.calculateEndDate();
    });
  }

  calculateEndDate() {
    const startDateControl = this.createTicketForm.get('appointmentStartTime');
    const startTimeControl = this.createTicketForm.get('startTime');
    const durationControl = this.createTicketForm.get('duration');

    if (startDateControl && startTimeControl && durationControl) {
      const startDate = new Date(startDateControl.value);
      const startTime = startTimeControl.value;
      const duration = durationControl.value;

      if (startDate && startTime && duration) {
        const [hours, minutes] = startTime.split(':').map(Number);
        startDate.setHours(hours);
        startDate.setMinutes(minutes);
        this.createTicketForm
          .get('appointmentStartTime')
          ?.setValue(startDate, { emitEvent: false });

        const endDate = new Date(startDate.getTime());
        endDate.setTime(endDate.getTime() + duration * 60 * 60 * 1000); // duration is in hours
        this.createTicketForm
          .get('appointmentEndTime')
          ?.setValue(endDate, { emitEvent: false });
      }
    }
  }

  submitForm() {
    this.isSubmitting = true;
    console.log('submitting form', this.createTicketForm.value);
    if (this.createTicketForm.valid) {
      const formData = this.createTicketForm.getRawValue(); // getRawValue includes disabled controls
      let ticket = {
        ...formData,
        startTime: formData.startTime, // use correct form control name
        appointmentEndTime: formData.appointmentEndTime, // use correct form control name
      };

      // Remove startTime and duration from ticket
      delete ticket.startTime;
      delete ticket.duration;

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
}
