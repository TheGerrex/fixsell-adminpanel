import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { MatDialog } from '@angular/material/dialog';
import { CfdiService } from 'src/app/shared/services/cfdi.service';
import { TaxRegime, TaxRegimeService } from 'src/app/shared/services/tax-regime.service';
import { LocationService } from 'src/app/shared/services/location.service';
import { ClientsService } from '../../services/clients.service';

@Component({
  selector: 'app-client-create',
  templateUrl: './client-create.component.html',
  styleUrl: './client-create.component.scss',
})
export class ClientCreateComponent implements OnInit {
  public createClientForm!: FormGroup;
  public cfdiValues: string[] = [];
  public taxRegimeValues: TaxRegime[] = [];
  public states: { code: string; name: string }[] = [];
  hide = true;
  isLoading = false;
  isSubmittingForm = false;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private toastService: ToastService,
    private validatorsService: ValidatorsService,
    private clientService: ClientsService,
    private dialog: MatDialog,
    private cfdiService: CfdiService,
    private taxRegimeService: TaxRegimeService,
    private locationService: LocationService,
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.initializeForm();
    this.cfdiValues = this.cfdiService.getCfdiValues();
    this.taxRegimeValues = this.taxRegimeService.getTaxRegimes();
    this.updateStates();
    this.createClientForm.get('country')?.valueChanges.subscribe(country => {
      this.updateStates(country);
    });
    this.isLoading = false;
  }

  initializeForm() {
    this.createClientForm = this.fb.group(
      {
        businessName: ['', Validators.required],
        commercialName: ['', Validators.required],
        rfc: ['', Validators.required],
        street: ['', Validators.required],
        exteriorNumber: ['', Validators.required],
        interiorNumber: [''],
        neighborhood: ['', Validators.required],
        cfdiUse: ['', Validators.required],
        isrRetention: [false, Validators.required],
        locality: [''],
        municipality: ['', Validators.required],
        state: ['', Validators.required],
        country: ['', Validators.required],
        postalCode: ['', Validators.required],
        reference: [''],
        legalRepresentative: ['', Validators.required],
        taxRegime: ['', Validators.required],
        // isActive: [true, Validators.required],
      }
    );
  }

  updateStates(country: string = 'México') {
    this.states = this.locationService.getStatesByCountry(country);
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.createClientForm, field);
  }

  getFieldError(field: string): string | null {
    if (!this.createClientForm.controls[field]) return null;

    const errors = this.createClientForm.controls[field].errors || {};

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

  submitForm() {
    if (this.createClientForm.invalid) {
      console.log('Invalid form');
      this.createClientForm.markAllAsTouched();
      return;
    }
    this.isSubmittingForm = true;

    const clientData = { ...this.createClientForm.value };

    console.log('Client Data:', clientData);
    this.clientService.createClient(clientData).subscribe({
      next: (response) => {
        this.isSubmittingForm = false;
        this.toastService.showSuccess('Cliente creado con éxito', 'Close');
        const clientId = response.id; // Assuming the response contains the created client's ID
        this.router.navigate([`/clients/${clientId}`]);
        this.createClientForm.reset();
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
}

