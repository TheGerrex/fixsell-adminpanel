import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { ToastService } from './../../../../shared/services/toast.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PackageService } from '../../services/package.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import {
  Observable,
  map,
  startWith,
  switchMap,
} from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { PrinterService } from 'src/app/website/printer/services/printer.service';
import { Printer } from 'src/app/website/interfaces/printer.interface';

@Component({
  selector: 'app-package-create',
  templateUrl: './package-create.component.html',
  styleUrls: ['./package-create.component.scss'],
})
export class PackageCreateComponent implements OnInit {
  public createPackageForm!: FormGroup;
  printerControl = new FormControl();
  printerPrice: number = 0;
  isSubmitting = false;
  selectedPrinter!: Printer;

  printerNameControl = new FormControl();
  filteredPrinterNames: Observable<string[]> | undefined;

  constructor(
    private toastService: ToastService,
    private router: Router,
    private fb: FormBuilder,
    private validatorsService: ValidatorsService,
    private packageService: PackageService,
    private printerService: PrinterService
  ) {}

  ngOnInit(): void {
    this.initalizeForm();
    this.filteredPrinterNames = this.printerControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) =>
        this.printerService.getAllRentablePrinters().pipe(
          map((printers) => printers.map((printer) => printer.model)),
          map((printerNames) => this._filter(value, printerNames))
        )
      )
    );
  }

  private _filter(value: string, printerNames: string[]): string[] {
    const filterValue = value.toLowerCase();
    return printerNames.filter((printerName) =>
      printerName.toLowerCase().includes(filterValue)
    );
  }

  initalizeForm() {
    this.createPackageForm = this.fb.group({
      printer: ['', Validators.required],
      packageDuration: [null],
      packageStartDate: ['', Validators.required],
      packageEndDate: ['', Validators.required],
      packageMonthlyPrice: [null, [Validators.required, Validators.min(0.01)]],
      packageDepositPrice: [null, [Validators.required, Validators.min(0.01)]],
      packageCurrency: ['MXN', Validators.required],
      packageDiscountPercentage: [null],
      packageDescription: [''],
      packagePrintsBw: [null],
      packagePrintsColor: [null],
      packageExtraClickPriceBw: [null],
      packageExtraClickPriceColor: [null],
      packageIncludes: this.fb.array([]),
    });
  }

  calculatePercentage() {
    const price = this.createPackageForm.controls['packagePrice'].value;
    const discount = ((this.printerPrice - price) / this.printerPrice) * 100;
    this.createPackageForm.controls['packageDiscountPercentage'].setValue(
      Number(discount.toFixed(1))
    );
  }

  calculatePrice() {
    const discount =
      this.createPackageForm.controls['packageDiscountPercentage'].value;
    const price = this.printerPrice * ((100 - discount) / 100);
    this.createPackageForm.controls['packagePrice'].setValue(price);
  }

  isValidField(field: string): boolean | null {
    // console.log(this.validatorsService.isValidField(this.createPrinterForm, field))
    return this.validatorsService.isValidField(this.createPackageForm, field);
  }

  getFieldError(field: string): string | null {
    if (!this.createPackageForm.controls[field]) return null;

    const errors = this.createPackageForm.controls[field].errors || {};

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

  addPrinterFromAutocomplete(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    this.addPrinter(value);
  }

  addPrinter(printerName: string = ''): void {
    if (printerName === '') {
      printerName = this.printerNameControl.value;
    }
    // Fetch the printer details
    this.printerService.getPrinterByName(printerName).subscribe((printer) => {
      this.selectedPrinter = printer;
      console.log(this.selectedPrinter);
    });
    this.packageService.getPrinterPrice(printerName).subscribe(
      (price) => {
        // this.printerPrice = price;
        this.printerControl.setValue(printerName);
        this.createPackageForm.controls['printer'].setValue(printerName);
        // this.createPackageForm.controls['packagePrice'].setValue(price);
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

  get packageIncludesControls() {
    return (this.createPackageForm.get('packageIncludes') as FormArray)
      .controls;
  }

  addInclude() {
    (this.createPackageForm.get('packageIncludes') as FormArray).push(
      new FormControl('')
    );
  }

  removeInclude(index: number) {
    (this.createPackageForm.get('packageIncludes') as FormArray).removeAt(
      index
    );
  }

  submitForm(): void {
    // sets selected printer to printer uuid
    this.createPackageForm.controls['printer'].setValue(
      this.printerControl.value
    );

    if (this.createPackageForm.invalid) {
      Object.keys(this.createPackageForm.controls).forEach((key) => {
        console.log(
          'Key = ' +
            key +
            ', Value = ' +
            this.createPackageForm.controls[key].value +
            ', Valid = ' +
            this.createPackageForm.controls[key].valid
        );
      });
      console.log('invalid form');
      this.toastService.showError(
        'Por favor, llena todos los campos requeridos',
        'Error'
      );
      console.log(this.createPackageForm.errors);
      console.log(this.createPackageForm);
      console.log(this.createPackageForm.value);

      this.createPackageForm.markAllAsTouched();
      return;
    }
    const formData = this.createPackageForm.value;

    this.isSubmitting = true;
    // gets id from printer name and creates package
    this.packageService.findPrinterIdByName(formData.printer).subscribe(
      (id) => {
        console.log(id);
        formData.printer = id;
        // this.createPackage(formData);
        console.log(formData);
        this.packageService.createPackage(formData).subscribe(
          (response) => {
            this.toastService.showSuccess('Package created successfully', 'OK');
            this.isSubmitting = false;
            this.router.navigate(['/website/packages']);
          },
          (error) => {
            console.log(error);
            this.isSubmitting = false;
            this.toastService.showError(
              'There was an error: ' +
                error.error.message +
                '. Please try again.',
              'error-snackbar'
            );
          }
        );
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
}
