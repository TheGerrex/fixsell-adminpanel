import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Lead, Communication } from 'src/app/sales/interfaces/leads.interface';
import { LeadsService } from '../../services/leads.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
@Component({
  selector: 'app-communication-create',
  templateUrl: './communication-create.component.html',
  styleUrls: ['./communication-create.component.scss'],
})
export class CommunicationCreateComponent implements OnInit {
  public createCommunicationForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  leadId = this.route.snapshot.paramMap.get('id');
  lead: Lead | null = null;
  Communication: Communication | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private leadsService: LeadsService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private validatorsService: ValidatorsService,
  ) { }

  ngOnInit() {
    this.loadLeadData();
    this.initializeForm();
  }

  initializeForm(): void {
    this.createCommunicationForm = this.fb.group({
      client: new FormControl(
        { value: this.lead?.client, disabled: true },
        Validators.required,
      ),
      message: new FormControl('', Validators.required),
      date: new FormControl(new Date().toISOString(), Validators.required),
      type: new FormControl('', Validators.required),
      notes: new FormControl(''),
      lead: new FormControl(this.leadId, Validators.required),
    });
  }

  loadLeadData() {
    this.leadsService.getLead(this.leadId ?? '').subscribe(
      (lead: Lead) => {
        this.lead = lead;
        console.log(lead);
        this.initializeForm(); // Call initializeForm here
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
        console.log('Comunicación creada correctamente:', response);
        this.toastService.showSuccess(
          'Comunicación creada con éxito',
          'success-snackbar',
        );
        this.router.navigate(['/sales/leads', this.leadId]);
      },
      (error: any) => {
        console.error('Error creando comunicación:', error);
        this.toastService.showError(
          'Error creando comunicación',
          'error-snackbar',
        );
      },
    );
  }
}
