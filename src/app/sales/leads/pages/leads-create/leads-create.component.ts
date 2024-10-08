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
  ) { }

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
    const filterValue = value.toLowerCase();
    return printerNames.filter((printerName) =>
      printerName.toLowerCase().includes(filterValue),
    );
  }

  onTypeChange(event: MatSelectChange): void {
    const value = event.value;

    // Update the BehaviorSubject with the new value
    this.selectedType.next(value);

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
      // You need to implement a method similar to addPrinter for consumibles
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
    this.dealService.getPrinterPrice(printerName).subscribe(
      (price) => {
        this.printerPrice = price;
        this.printerControl.setValue(printerName);
        this.createLeadForm.controls['product_interested'].setValue(
          printerName,
        );
      },
      (error) => {
        console.error(error);
        this.toastService.showError(
          'Hubo un error: ' +
          error.error.message +
          '. Por favor, intenta de nuevo.',
          'error-snackbar',
        );
      },
    );
  }

  addConsumible(consumibleName: string): void {
    console.log('Consumible:', consumibleName);
    if (consumibleName === '') {
      consumibleName = this.productControl.value;
    }
    this.dealService.getConsumiblePrice(consumibleName).subscribe(
      (price) => {
        console.log('Price:', price);
        this.createLeadForm.controls['product_interested'].setValue(
          consumibleName,
        );
      },
      (error) => {
        console.error(error);
        this.toastService.showError(
          'Hubo un error: ' +
          error.error.message +
          '. Por favor, intenta de nuevo.',
          'error-snackbar',
        );
      },
    );
  }

  initializeForm(): void {
    this.createLeadForm = this.fb.group({
      selectedType: ['printer'],
      client: new FormControl('', [Validators.required]),
      status: new FormControl('prospect', [Validators.required]),
      product_interested: new FormControl('', [Validators.required]),
      type_of_product: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [
        Validators.required,
        this.validatorsService.phoneValidator(),
      ]),
      communications: this.fb.array([
        this.fb.group({
          message: new FormControl(
            `Hola, quiero saber mas sobre el ${this.selectedType.getValue()}: ${this.productControl.value
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

  async submitForm() {
    this.isSubmitting = true;

    console.log('Form unprepared:', this.createLeadForm.value);
    //set communications.message to the value of the product interested
    this.createLeadForm.controls[
      'communications'
    ].value[0].message = `Hola, quiero saber mas sobre el ${this.selectedType.getValue()}: ${this.productControl.value
    }`;

    //delete selected type from form
    delete this.createLeadForm.value.selectedType;
    // Prepare the data
    const type_of_product =
      this.selectedType.getValue() === 'printer'
        ? 'printer'
        : 'consumible';
    this.createLeadForm.controls['type_of_product'].setValue(type_of_product);
    console.log('Form:', this.createLeadForm.value);

    // create lead without communcation first
    // Prepare the data
    const data = {
      client: this.createLeadForm.controls['client'].value,
      status: this.createLeadForm.controls['status'].value,
      product_interested:
        this.createLeadForm.controls['product_interested'].value,
      type_of_product: type_of_product,
      email: this.createLeadForm.controls['email'].value,
      phone: this.createLeadForm.controls['phone'].value,
    };
    console.log('Data for lead:', data);
    // Make the POST request to create lead
    this.leadsService.createLead(data).subscribe((lead) => {
      this.lead = lead;
      this.toastService.showSuccess(
        'Cliente potencial creado con éxito',
        'success-snackbar',
      );

      // Prepare the sales communication data
      const salesCommunicationData = {
        message: `Hola, quiero saber mas sobre el ${this.selectedType.getValue()}: ${this.productControl.value
          }`,
        date: new Date().toISOString(),
        type: 'manual',
        leadId: this.lead?.id,
        notes: 'generado automáticamente por el sistema',
      };
      console.log('Sales communication data:', salesCommunicationData);

      // Make the POST request for sales communication
      this.leadsService
        .createSalesCommunication(salesCommunicationData)
        .subscribe({
          next: (salesResponse: any) => {
            console.log(
              'Sales communication created successfully:',
              salesResponse,
            );
          },
          error: (salesError) => {
            console.error('Error creating sales communication:', salesError);
          },
        });
      this.isSubmitting = false;
      this.router.navigate([`/sales/leads/${this.lead?.id}`]);
    });
  }
}
