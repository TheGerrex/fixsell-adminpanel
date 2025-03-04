import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Lead } from 'src/app/sales/interfaces/leads.interface';
import { LeadsService } from '../../services/leads.service';
import { DealService } from 'src/app/website/deal/services/deal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { startWith, map, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSelectChange } from '@angular/material/select';
@Component({
  selector: 'app-leads-create',
  templateUrl: './leads-create.component.html',
  styleUrls: ['./leads-create.component.scss'],
})
export class LeadsCreateComponent implements OnInit {
  public createLeadForm!: FormGroup;
  lead: Lead | null = null;
  isLoading = false;
  isSubmitting = false;
  selectedType = new BehaviorSubject<string>('printer');
  filteredProductNames: Observable<string[]> | undefined;
  productControl = new FormControl();

  // filter printers
  printerControl = new FormControl();
  printerPrice: number = 0;

  printerNameControl = new FormControl();
  filteredPrinterNames: Observable<string[]> | undefined;
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
    this.isLoading = true;
    this.initializeForm();
    this.isLoading = false;

    this.filteredPrinterNames = this.printerControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) => {
        return this.dealService.getAllPrinterNames().pipe(
          map((printerNames) => {
            console.log('All Printer Names:', printerNames);
            return this._filter(value, printerNames);
          }),
        );
      }),
    );

    this.filteredProductNames = this.productControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) =>
        this.selectedType.getValue() === 'printer'
          ? this.dealService
              .getAllPrinterNames()
              .pipe(map((productNames) => this._filter(value, productNames)))
          : this.dealService
              .getAllConsumiblesNames()
              .pipe(map((productNames) => this._filter(value, productNames))),
      ),
    );
  }

  private _filter(value: string, printerNames: string[]): string[] {
    const filterValue = value?.toLowerCase() || '';
    return printerNames.filter((printerName) =>
      printerName.toLowerCase().includes(filterValue),
    );
  }

  onTypeChange(event: MatSelectChange): void {
    const value = event.value;

    // Update the BehaviorSubject with the new value
    this.selectedType.next(value);

    // Set the type_of_product in the form
    const productType = value === 'printer' ? 'printer' : 'consumible';
    this.createLeadForm.get('type_of_product')?.setValue(productType);

    // Clear the productControl value
    this.productControl.reset();

    //if printer
    if (value === 'printer') {
      this.filteredProductNames = this.productControl.valueChanges.pipe(
        startWith(''),
        switchMap((value) =>
          this.dealService
            .getAllPrinterNames()
            .pipe(map((productNames) => this._filter(value, productNames))),
        ),
      );
    } else {
      //if consumible
      this.filteredProductNames = this.productControl.valueChanges.pipe(
        startWith(''),
        switchMap((value) =>
          this.dealService
            .getAllConsumiblesNames()
            .pipe(map((productNames) => this._filter(value, productNames))),
        ),
      );
    }
  }

  addProductFromAutocomplete(event: MatAutocompleteSelectedEvent) {
    if (this.selectedType.getValue() === 'printer') {
      // Add selected printer
      this.addPrinter(event.option.viewValue);
    } else {
      // Add selected consumible
      this.addConsumible(event.option.viewValue);
    }
  }

  addPrinterFromAutocomplete(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    this.addPrinter(value);
  }

  addPrinter(printerName: string = ''): void {
    if (printerName === '') {
      printerName = this.printerNameControl.value;
    }
    if (!printerName) {
      return;
    }

    this.dealService.getPrinterPrice(printerName).subscribe({
      next: (price) => {
        this.printerPrice = price;
        this.printerControl.setValue(printerName);
        this.createLeadForm.get('product_interested')?.setValue(printerName);
      },
      error: (error) => {
        console.error(error);
        this.toastService.showError(
          'Hubo un error: ' +
            (error.error?.message || 'Error desconocido') +
            '. Por favor, intenta de nuevo.',
          'error-snackbar',
        );
      },
    });
  }

  addConsumible(consumibleName: string): void {
    console.log('Consumible:', consumibleName);
    if (consumibleName === '') {
      consumibleName = this.productControl.value;
    }
    if (!consumibleName) {
      return;
    }

    this.dealService.getConsumiblePrice(consumibleName).subscribe({
      next: (price) => {
        console.log('Price:', price);
        this.createLeadForm.get('product_interested')?.setValue(consumibleName);
      },
      error: (error) => {
        console.error(error);
        this.toastService.showError(
          'Hubo un error: ' +
            (error.error?.message || 'Error desconocido') +
            '. Por favor, intenta de nuevo.',
          'error-snackbar',
        );
      },
    });
  }

  initializeForm(): void {
    this.createLeadForm = this.fb.group({
      selectedType: ['printer'],
      client: new FormControl('', [Validators.required]),
      status: new FormControl('prospect', [Validators.required]),
      product_interested: new FormControl('', [Validators.required]),
      type_of_product: new FormControl('printer', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [
        Validators.required,
        this.validatorsService.phoneValidator(),
      ]),
      communications: this.fb.array([
        this.fb.group({
          message: new FormControl(
            `Hola, quiero saber mas sobre el ${this.selectedType.getValue()}: ${
              this.productControl.value || ''
            }`,
            [Validators.required],
          ),
          date: new FormControl(new Date().toISOString(), [
            Validators.required,
          ]),
          type: new FormControl('manual'),
          notes: new FormControl('generado manualmente en el sistema'),
        }),
      ]),
    });
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.createLeadForm, field);
  }

  getFieldError(field: string): string | null {
    return this.validatorsService.getFieldError(this.createLeadForm, field);
  }

  private logFormValidity(): void {
    console.log('Form validity check:');
    console.log('Form valid:', this.createLeadForm.valid);
    console.log('Form values:', this.createLeadForm.value);
    console.log('Form errors:', this.createLeadForm.errors);

    Object.keys(this.createLeadForm.controls).forEach((key) => {
      const control = this.createLeadForm.get(key);
      console.log(
        `Field ${key}: valid=${control?.valid}, value=${control?.value}, errors=`,
        control?.errors,
      );
    });
  }

  async submitForm() {
    this.logFormValidity();

    // Check if product_interested is empty but there's a value in productControl
    if (
      !this.createLeadForm.get('product_interested')?.value &&
      this.productControl.value
    ) {
      this.createLeadForm
        .get('product_interested')
        ?.setValue(this.productControl.value);
    }

    // Ensure type_of_product is set
    if (!this.createLeadForm.get('type_of_product')?.value) {
      const type =
        this.selectedType.getValue() === 'printer' ? 'printer' : 'consumible';
      this.createLeadForm.get('type_of_product')?.setValue(type);
    }

    // Log the state of every control in the form
    Object.keys(this.createLeadForm.controls).forEach((key) => {
      const control = this.createLeadForm.get(key);
      console.log(
        `Control: ${key}, Valid: ${control?.valid}, Value: ${control?.value}, Errors:`,
        control?.errors,
      );
    });

    if (this.createLeadForm.invalid) {
      this.toastService.showError(
        'Por favor complete todos los campos requeridos',
        'error-snackbar',
      );
      this.createLeadForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    console.log('Form unprepared:', this.createLeadForm.value);

    const type_of_product =
      this.selectedType.getValue() === 'printer' ? 'printer' : 'consumible';

    // create lead without communication first
    const data = {
      client: this.createLeadForm.get('client')?.value,
      status: this.createLeadForm.get('status')?.value,
      product_interested: this.createLeadForm.get('product_interested')?.value,
      type_of_product: type_of_product,
      email: this.createLeadForm.get('email')?.value,
      phone: this.createLeadForm.get('phone')?.value,
    };

    console.log('Data for lead:', data);

    try {
      // Make the POST request to create lead
      this.leadsService.createLead(data).subscribe({
        next: (leadResponse) => {
          console.log('Lead created response:', leadResponse);

          // If no lead response, try to recover by looking up the lead
          if (!leadResponse) {
            this.toastService.showWarning(
              'El lead fue creado pero hubo un error en la respuesta. Intentando recuperar datos...',
              'warning-snackbar',
            );

            // Navigate to the leads list since we couldn't get the lead details
            setTimeout(() => {
              this.isSubmitting = false;
              this.router.navigate(['/sales/leads']);
            }, 1500);
            return;
          }

          this.lead = leadResponse;

          // If we have a lead but no ID (which should never happen with a proper backend)
          if (!this.lead || !this.lead.id) {
            this.toastService.showWarning(
              'Lead creado pero falta información. Verifique en la lista de leads.',
              'warning-snackbar',
            );
            this.isSubmitting = false;
            this.router.navigate(['/sales/leads']);
            return;
          }

          this.toastService.showSuccess(
            'Cliente potencial creado con éxito',
            'success-snackbar',
          );
          this.createSalesCommunication(this.lead.id);
        },
        error: (error) => {
          console.error('Error creating lead:', error);
          this.toastService.showError(
            'Error al crear el cliente potencial: ' +
              (error.error?.message || 'Error desconocido'),
            'error-snackbar',
          );
          this.isSubmitting = false;
        },
      });
    } catch (error) {
      console.error('Exception in lead creation:', error);
      this.toastService.showError(
        'Error inesperado al crear el lead',
        'error-snackbar',
      );
      this.isSubmitting = false;
    }
  }

  private createSalesCommunication(leadId: number | string) {
    const salesCommunicationData = {
      message: `Hola, quiero saber mas sobre el ${this.selectedType.getValue()}: ${
        this.productControl.value ||
        this.createLeadForm.get('product_interested')?.value ||
        ''
      }`,
      date: new Date().toISOString(),
      type: 'manual',
      leadId: leadId,
      notes: 'generado automáticamente por el sistema',
    };

    console.log('Sales communication data:', salesCommunicationData);

    this.leadsService
      .createSalesCommunication(salesCommunicationData)
      .subscribe({
        next: (response) => {
          console.log('Communication created:', response);
          this.isSubmitting = false;
          this.router.navigate([`/sales/leads/${leadId}`]);
        },
        error: (error) => {
          console.error('Error creating communication:', error);
          this.isSubmitting = false;
          // Still navigate to the lead since it was created successfully
          this.router.navigate([`/sales/leads/${leadId}`]);
        },
      });
  }
}
