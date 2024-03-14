import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Printer } from '../../../interfaces/printer.interface';
import { DealService } from '../../services/deal.service';
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
import { Deal } from 'src/app/website/interfaces/deal.interface';

@Component({
  selector: 'app-deal-create',
  templateUrl: './deal-create.component.html',
  styleUrls: ['./deal-create.component.scss'],
})
export class DealCreateComponent implements OnInit {
  public createDealForm!: FormGroup;
  deal: Deal | null = null;
  isLoadingForm = false;
  selectedType = new BehaviorSubject<string>('multifuncional');
  filteredProductNames: Observable<string[]> | undefined;
  productControl = new FormControl();
  isSubmitting = false;

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
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private validatorsService: ValidatorsService
  ) {}

  ngOnInit() {
    this.initializeForm();

    this.filteredPrinterNames = this.printerControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) =>
        this.dealService
          .getAllPrinterNames()
          .pipe(map((printerNames) => this._filter(value, printerNames)))
      )
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
              .pipe(map((productNames) => this._filter(value, productNames)))
      )
    );
  }

  private _filter(value: string, printerNames: string[]): string[] {
    const filterValue = value.toLowerCase();
    return printerNames.filter((printerName) =>
      printerName.toLowerCase().includes(filterValue)
    );
  }

  initializeForm() {
    this.createDealForm = this.fb.group({
      selectedType: ['multifuncional'],
      printer: ['', Validators.required],
      printerPrice: [{ value: '', disabled: true }, Validators.required],
      dealStartDate: ['', Validators.required],
      dealEndDate: ['', Validators.required],
      dealPrice: ['', Validators.required],
      dealCurrency: ['USD', Validators.required],
      dealDiscountPercentage: ['', Validators.required],
      dealDescription: ['', Validators.required],
    });
  }

  onTypeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target?.value;
    // Update the BehaviorSubject with the new value
    this.selectedType.next(value);

    //if multifuncional
    if (value === 'multifuncional') {
      this.filteredProductNames = this.productControl.valueChanges.pipe(
        startWith(''),
        switchMap((value) =>
          this.dealService
            .getAllPrinterNames()
            .pipe(map((productNames) => this._filter(value, productNames)))
        )
      );
    } else {
      //if consumible
      this.filteredProductNames = this.productControl.valueChanges.pipe(
        startWith(''),
        switchMap((value) =>
          this.dealService
            .getAllConsumiblesNames()
            .pipe(map((productNames) => this._filter(value, productNames)))
        )
      );
    }
  }

  addProductFromAutocomplete(event: MatAutocompleteSelectedEvent) {
    if (this.selectedType.getValue() === 'multifuncional') {
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
        this.createDealForm.controls['printer'].setValue(printerName);
        this.createDealForm.controls['printerPrice'].setValue(price);
      },
      (error) => {
        console.error(error);
        this.toastService.showError(
          'Hubo un error: ' +
            error.error.message +
            '. Por favor, intenta de nuevo.',
          'error-snackbar'
        );
      }
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
        this.createDealForm.controls['printer'].setValue(consumibleName);
        this.createDealForm.controls['printerPrice'].setValue(price);
      },
      (error) => {
        console.error(error);
        this.toastService.showError(
          'Hubo un error: ' +
            error.error.message +
            '. Por favor, intenta de nuevo.',
          'error-snackbar'
        );
      }
    );
  }

  calculatePrice() {
    if (this.createDealForm.get('dealDiscountPercentage')?.value) {
      const discount =
        Number(this.createDealForm.get('printerPrice')?.value) *
        (Number(this.createDealForm.get('dealDiscountPercentage')?.value) /
          100);
      this.createDealForm
        .get('dealPrice')
        ?.setValue(
          (
            Number(this.createDealForm.get('printerPrice')?.value) - discount
          ).toString()
        ); // Convert the calculated price to a string
    }
  }

  calculatePercentage() {
    if (this.createDealForm.get('dealPrice')?.value) {
      const discount =
        Number(this.createDealForm.get('printerPrice')?.value) -
        Number(this.createDealForm.get('dealPrice')?.value); // Convert the deal price value to a number
      const percentage =
        (discount / Number(this.createDealForm.get('printerPrice')?.value)) *
        100;
      this.createDealForm
        .get('dealDiscountPercentage')
        ?.setValue(percentage.toFixed(0).toString()); // Convert the percentage to a string
    }
  }

  setSelectedPrinter(event: any) {}

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.createDealForm, field);
  }

  getFieldError(field: string): string | null {
    if (!this.createDealForm.controls[field]) return null;

    const errors = this.createDealForm.controls[field].errors || {};

    console.log(errors);

    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido';
        case 'pattern':
          return 'Este campo esta en formato incorrecto';
        case 'maxlength':
          return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
        default:
          return 'Error desconocido';
      }
    }
    return null;
  }

  async submitForm() {
    if (this.createDealForm.invalid) {
      Object.keys(this.createDealForm.controls).forEach((key) => {
        console.log(
          'Key = ' +
            key +
            ', Value = ' +
            this.createDealForm.controls[key].value +
            ', Valid = ' +
            this.createDealForm.controls[key].valid
        );
      });
      console.log('invalid form');
      //reason of invalid form
      console.log(this.createDealForm.errors);
      console.log(this.createDealForm);
      console.log(this.createDealForm.value);

      this.createDealForm.markAllAsTouched();
      return;
    }
    const formData = this.createDealForm.value;
    formData.dealDiscountPercentage = Number(formData.dealDiscountPercentage);

    try {
      let id: any;
      if (formData.selectedType === 'multifuncional') {
        id = await this.dealService
          .findPrinterIdByName(formData.printer)
          .toPromise();
        if (id) {
          formData.printer = id; // set the printer id in the deal object
        }
      } else if (formData.selectedType === 'consumible') {
        id = await this.dealService
          .findConsumibleIdByName(formData.printer)
          .toPromise();
        console.log('Consumible id:', id);
        if (id) {
          formData.consumible = id; // set the consumible id in the deal object
          delete formData.printer; // delete the printer property
        }
      }
      delete formData.selectedType; // remove the selectedType property
    } catch (error: any) {
      this.toastService.showError(error.error.message, 'Cerrar');
      return;
    }
    this.isSubmitting = true;

    
    
    console.log('formData:', formData);
    this.dealService.submitDealCreateForm(formData).subscribe(
      (response: Deal) => {
        console.log('Response:', response);
        this.isSubmitting = false;
        this.toastService.showSuccess('Promoción creado', 'Cerrar'); // Show success toast
        this.router.navigate(['/website/deals/', response.id,]);
      },
      (error) => {
        console.log('Error:', error);
        //log object to console
        console.log("Error FormData:",formData);
        this.isSubmitting = false;
        this.toastService.showError(
          error.error.message,
          'Cerrar'
        );
      }
    );
  }
}
