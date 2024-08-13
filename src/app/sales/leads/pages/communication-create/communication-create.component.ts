import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Lead, Communication } from 'src/app/sales/interfaces/leads.interface';
import { LeadsService } from '../../services/leads.service';
import { DealService } from 'src/app/website/deal/services/deal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { startWith, map, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
@Component({
  selector: 'app-communication-create',
  templateUrl: './communication-create.component.html',
  styleUrls: ['./communication-create.component.scss'],
})
export class CommunicationCreateComponent implements OnInit {
  public createCommunicationForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  lead: Lead | null = null;
  Communication: Communication | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private dealService: DealService,
    private leadsService: LeadsService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private validatorsService: ValidatorsService,
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm(): void {
    const leadId = this.route.snapshot.paramMap.get('id');
    console.log(leadId);

    this.leadsService.getLead(leadId ?? '').subscribe(
      (lead: Lead) => {
        this.lead = lead;
        console.log(lead);
        this.createCommunicationForm = this.fb.group({
          client: new FormControl(
            { value: this.lead?.client, disabled: true },
            Validators.required,
          ),
          message: new FormControl('', Validators.required),
          date: new FormControl(new Date().toISOString(), Validators.required),
          type: new FormControl('', Validators.required),
          notes: new FormControl(''),
          lead: new FormControl(leadId, Validators.required),
        });
      },
      (error: any) => {
        console.error('Error fetching lead:', error);
      },
    );
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(
      this.createCommunicationForm,
      field,
    );
  }

  getFieldError(field: string): string | null {
    return this.validatorsService.getFieldError(
      this.createCommunicationForm,
      field,
    );
  }

  async submitForm() {
    this.isSubmitting = true;

    console.log('Form submitted:', this.createCommunicationForm.value);

    let communicationData = {
      ...this.createCommunicationForm.value,
      leadId: Number(this.createCommunicationForm.value.lead),
    };
    delete communicationData.lead; // remove the original 'lead' property
    console.log('Form prepared:', communicationData.value);

    this.leadsService.createSalesCommunication(communicationData).subscribe(
      (response: any) => {
        console.log('Communication created:', response);
        this.toastService.showSuccess(
          'Comunicación creada con éxito',
          'success-snackbar',
        );
        this.router.navigate(['/sales/leads']);
      },
      (error: any) => {
        console.error('Error creating communication:', error);
        this.toastService.showError(
          'Error creando la comunicación',
          'error-snackbar',
        );
      },
    );
  }
}
