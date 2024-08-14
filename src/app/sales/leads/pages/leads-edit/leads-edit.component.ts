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
  selector: 'app-leads-edit',
  templateUrl: './leads-edit.component.html',
  styleUrls: ['./leads-edit.component.scss'],
})
export class LeadsEditComponent {
  public editLeadForm!: FormGroup;
  lead: Lead | null = null;
  isLoading = false;
  selectedType = new BehaviorSubject<string>('multifuncional');
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
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.leadsService.getLead(id).subscribe((lead) => {
        this.lead = lead;
        this.populateForm(lead);
      });
    });
    this.initializeForm();

    this.filteredPrinterNames = this.printerControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) =>
        this.dealService
          .getAllPrinterNames()
          .pipe(map((printerNames) => this._filter(value, printerNames))),
      ),
    );

    this.filteredProductNames = this.productControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) =>
        this.selectedType.getValue() === 'multifuncional'
          ? this.dealService
            .getAllPrinterNames()
            .pipe(map((productNames) => this._filter(value, productNames)))
          : this.dealService
            .getAllConsumiblesNames()
            .pipe(map((productNames) => this._filter(value, productNames))),
      ),
    );
  }

  populateForm(lead: Lead) {
    this.editLeadForm.patchValue({
      client: lead.client,
      status: lead.status,
      product_interested: lead.product_interested,
      type_of_product: lead.type_of_product,
      email: lead.email,
      phone: lead.phone,
      selectedType:
        lead.type_of_product === 'printer' ? 'multifuncional' : 'consumible',
    });
    this.productControl.patchValue(lead.product_interested);
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

    //if multifuncional
    if (value === 'multifuncional') {
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
    const value = event.option.viewValue;
    this.selectedType.subscribe((type) => {
      if (type === 'multifuncional') {
        // Add selected printer
        this.addPrinter(value);
      } else {
        // Add selected consumible
        this.addConsumible(value);
      }
      // Set the value of the productControl form control
      this.productControl.setValue(value);
    });
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
        this.editLeadForm.controls['product_interested'].setValue(printerName);
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
        this.editLeadForm.controls['product_interested'].setValue(
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
    this.editLeadForm = this.fb.group({
      selectedType: [this.selectedType.getValue()],
      client: new FormControl('', [Validators.required]),
      status: new FormControl('', [Validators.required]),
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
    return this.validatorsService.isValidField(this.editLeadForm, field);
  }

  getFieldError(field: string): string | null {
    return this.validatorsService.getFieldError(this.editLeadForm, field);
  }

  async submitForm() {
    this.isLoading = true;

    console.log('Form unprepared:', this.editLeadForm.value);

    //delete selected type from form
    delete this.editLeadForm.value.selectedType;

    // Prepare the data
    const type_of_product =
      this.selectedType.getValue() === 'multifuncional'
        ? 'printer'
        : 'consumible';
    this.editLeadForm.controls['type_of_product'].setValue(type_of_product);
    console.log('Form:', this.editLeadForm.value);

    // update lead without communication
    this.isLoading = true;

    // Prepare the data
    const data = {
      client: this.editLeadForm.controls['client'].value,
      status: this.editLeadForm.controls['status'].value,
      product_interested:
        this.editLeadForm.controls['product_interested'].value,
      type_of_product: type_of_product,
      email: this.editLeadForm.controls['email'].value,
      phone: this.editLeadForm.controls['phone'].value,
    };
    console.log('Data for lead:', data);

    // Make the PUT request to update lead
    if (this.lead && this.lead.id) {
      this.leadsService
        .updateLead(data, this.lead.id.toString())
        .subscribe(
          (lead) => {
            this.lead = lead;
            this.toastService.showSuccess(
              'Cliente potencial actualizado correctamente',
              'ok',
            );
            this.isLoading = false;
            this.router.navigate(['../'], { relativeTo: this.route });
          },
          (error) => {
            this.isLoading = false;
            this.toastService.showError(
              'Error al actualizar el cliente potencial', error.message,
            );
          }
        );
    }
  }
}
