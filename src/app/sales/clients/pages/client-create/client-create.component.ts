import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { Cfdi, CfdiService } from 'src/app/shared/services/cfdi.service';
import { TaxRegime, TaxRegimeService } from 'src/app/shared/services/tax-regime.service';
import { LocationService } from 'src/app/shared/services/location.service';
import { ClientsService } from '../../services/clients.service';
import { User } from 'src/app/auth/interfaces';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-client-create',
  templateUrl: './client-create.component.html',
  styleUrl: './client-create.component.scss',
})
export class ClientCreateComponent implements OnInit {
  public createClientTaxForm!: FormGroup;
  public createComercialConditionsClientForm!: FormGroup;
  public createClassificationClientForm!: FormGroup;
  public createSuspensionConfigClientForm!: FormGroup;
  public createComplementInfoClientForm!: FormGroup;
  public createBillingAddressClientForm!: FormGroup;
  public createShippingAddressClientForm!: FormGroup;
  public createContactsClientForm!: FormGroup;
  public createPrintersClientForm!: FormGroup;
  public createAccountsClientForm!: FormGroup;
  public cfdiValues: Cfdi[] = [];
  public taxRegimeValues: TaxRegime[] = [];
  public states: { code: string; name: string }[] = [];
  public daysOfWeek: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  executives: User[] = [];
  collectionExecutives: User[] = [];
  hide = true;
  isLoading = false;
  isSubmittingForm = false;
  clientId = '';
  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private validatorsService: ValidatorsService,
    private clientService: ClientsService,
    private cfdiService: CfdiService,
    private taxRegimeService: TaxRegimeService,
    private locationService: LocationService,
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.loadExecutives();
    this.initializeTaxDataForm();
    this.initializeComercialConditionsForm();
    this.cfdiValues = this.cfdiService.getCfdiValues();
    this.taxRegimeValues = this.taxRegimeService.getTaxRegimes();
    this.updateStates();
    this.createClientTaxForm.get('country')?.valueChanges.subscribe(country => {
      this.updateStates(country);
    });
    this.isLoading = false;
  }

  initializeTaxDataForm() {
    this.createClientTaxForm = this.fb.group(
      {
        businessName: ['', Validators.required],
        commercialName: ['', Validators.required],
        rfc: ['', Validators.required],
        street: ['', Validators.required],
        exteriorNumber: ['', Validators.required],
        interiorNumber: [''],
        neighborhood: ['', Validators.required],
        cfdiUse: ['', Validators.required],
        locality: [''],
        municipality: ['', Validators.required],
        state: ['', Validators.required],
        country: ['México', Validators.required],
        postalCode: ['', Validators.required],
        reference: [''],
        legalRepresentative: ['', Validators.required],
        taxRegime: ['', Validators.required],
        // isActive: [true, Validators.required],
      }
    );
  }

  initializeComercialConditionsForm(): void {
    this.createComercialConditionsClientForm = this.fb.group({
      assignedExecutiveId: [null, Validators.required], // Dropdown for assigned executive
      collectionExecutiveId: [null, Validators.required], // Dropdown for collection executives
      creditDays: [null, [Validators.required, Validators.min(0)]], // Number input for credit days
      creditLimit: [null, [Validators.required, Validators.min(0)]], // Number input for credit limit
      isActive: [true, Validators.required], // Slide toggle for active status
      isrRetention: [false, Validators.required], // Slide toggle for ISR retention
      applyVatWithholding: [false, Validators.required], // Slide toggle for VAT withholding
      validateCreditLimitInSales: [false, Validators.required], // Slide toggle for credit limit validation
      collectionObservations: [''], // Textarea for collection observations
      currency: ['MXN'], // Dropdown for currency
      reviewDays: [[]], // Multi-select for review days
      paymentDays: [[]] // Multi-select for payment days
    });
  }

  getClientData(clientId: string) {
    this.clientService.getClient(clientId).subscribe({
      next: (client) => {
        this.createClientTaxForm.patchValue(client);

        // Set the CFDI code in the form
        const selectedCfdi = this.cfdiValues.find(
          (cfdi) => cfdi.code === client.cfdiUse.code
        );
        if (selectedCfdi) {
          this.createClientTaxForm.get('cfdiUse')?.setValue(selectedCfdi);
        }

        // Set the Tax Regime
        const selectedTaxRegime = this.taxRegimeValues.find(
          (regime) => regime.description === client.taxRegime.description
        );
        if (selectedTaxRegime) {
          this.createClientTaxForm.get('taxRegime')?.setValue(selectedTaxRegime);
        }
      },
      error: (error) => {
        this.toastService.showError(
          `Error fetching client data: ${error.error.message}`,
          'Close'
        );
        console.error('Error fetching client data:', error.error.message);
      },
    });
  }

  loadExecutives(): void {
    this.clientService.fetchExecutives().subscribe((executives) => {
      this.executives = executives;
      this.collectionExecutives = executives;
    });
  }

  updateStates(country: string = 'México') {
    this.states = this.locationService.getStatesByCountry(country);
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.createClientTaxForm, field);
  }

  getFieldError(field: string): string | null {
    if (!this.createClientTaxForm.controls[field]) return null;

    const errors = this.createClientTaxForm.controls[field].errors || {};

    console.log(errors);

    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido';
        case 'pattern':
          return 'Este campo está en formato incorrecto';
        case 'maxlength':
          return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
        default:
          return 'Error desconocido';
      }
    }
    return null;
  }

  // Check if all forms are valid
  isAllStepsCompleted(): boolean {
    return (
      this.createClientTaxForm.valid &&
      this.createComercialConditionsClientForm.valid
    );
  }

  submitTaxForm() {
    if (this.createClientTaxForm.invalid) {
      console.log('Invalid form');
      this.createClientTaxForm.markAllAsTouched();
      return;
    }
    this.isSubmittingForm = true;

    const clientData = { ...this.createClientTaxForm.value };

    console.log('Client Data:', clientData);
    this.clientService.createClient(clientData).subscribe({
      next: (response) => {
        this.isSubmittingForm = false;
        this.toastService.showSuccess('Datos fiscales guardados correctamente', 'Close');
      },
      error: (error) => {
        this.isSubmittingForm = false;
        this.toastService.showError(
          `Error creando cliente: ${error.error.message}`,
          'Close',
        );
        console.error('Error creando cliente:', error.error.message);
      },
    });
  }

  submitAllForms(): void {
    if (this.isSubmittingForm) return;

    this.isSubmittingForm = true;

    // Step 1: Submit Tax Form
    if (this.createClientTaxForm.invalid) {
      console.log('Tax form is invalid.');
      this.createClientTaxForm.markAllAsTouched();
      this.isSubmittingForm = false;
      return;
    }

    const clientData = { ...this.createClientTaxForm.value };
    this.clientService.createClient(clientData).subscribe({
      next: (response) => {
        this.clientId = response.id; // Assuming the response contains the client ID
        console.log('Client created successfully with ID:', this.clientId);

        // Step 2: Submit Commercial Conditions Form
        this.submitCommercialConditionsForm();
      },
      error: (err) => {
        console.error('Error submitting tax form:', err);
        this.toastService.showError('Error submitting tax form', 'Close');
        this.isSubmittingForm = false;
      },
    });
  }

  private submitCommercialConditionsForm(): void {
    if (this.createComercialConditionsClientForm.invalid) {
      console.error('Commercial conditions form is invalid.');
      this.createComercialConditionsClientForm.markAllAsTouched();
      this.isSubmittingForm = false;
      return;
    }

    const commercialConditionsPayload = {
      ...this.createComercialConditionsClientForm.value,
      clientId: this.clientId, // Add clientId to the payload
    };

    this.clientService.createCommercialCondition(commercialConditionsPayload).subscribe({
      next: () => {
        console.log('Commercial conditions submitted successfully!');
      },
      error: (err) => {
        console.error('Error submitting commercial conditions:', err);
        this.toastService.showError('Error submitting commercial conditions', 'Close');
        this.isSubmittingForm = false;
      },
    });
  }

  private finalizeSubmission(): void {
    console.log('All forms submitted successfully!');
    this.toastService.showSuccess('All forms submitted successfully!', 'Close');
    this.isSubmittingForm = false;
  }

  skipStep(stepper: MatStepper): void {
    console.log('Skipping step...');
    stepper.next(); // Move to the next step
  }
}

