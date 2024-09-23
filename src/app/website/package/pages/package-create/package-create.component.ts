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
import { Observable, map, startWith, switchMap } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { PrinterService } from 'src/app/website/printer/services/printer.service';
import { Printer } from 'src/app/website/interfaces/printer.interface';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-package-create',
  templateUrl: './package-create.component.html',
  styleUrls: ['./package-create.component.scss'],
})
export class PackageCreateComponent implements OnInit {
  createPackageForm!: FormGroup;
  printerControl = new FormControl();
  customOptionControl: FormControl = new FormControl();
  printerNameControl = new FormControl();
  printerPrice: number = 0;
  selectedPrinter!: Printer;
  filteredPrinterNames: Observable<string[]> | undefined;
  isSubmitting = false;
  showCustomOptionInput: boolean = false;
  predefinedOptions: string[] = [
    'Tóner, consumibles y refacciones',
    'Servicios preventivos',
    'Servicios correctivos ilimitados',
    'Tiempo de respuesta 6 hrs. máximo',
    'Capacitación de uso del equipo',
    'Servicio técnico certificado por la marca'];



  constructor(
    private toastService: ToastService,
    private router: Router,
    private fb: FormBuilder,
    private validatorsService: ValidatorsService,
    private packageService: PackageService,
    private printerService: PrinterService,
  ) { }

  ngOnInit(): void {
    this.initalizeForm();
    this.filteredPrinterNames = this.printerControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) =>
        this.printerService.getAllRentablePrinters().pipe(
          map((printers) => printers.map((printer) => printer.model)),
          map((printerNames) => this._filter(value, printerNames)),
        ),
      ),
    );
  }

  private _filter(value: string, printerNames: string[]): string[] {
    const filterValue = value.toLowerCase();
    return printerNames.filter((printerName) =>
      printerName.toLowerCase().includes(filterValue),
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
      customOption: this.customOptionControl,
    });
  }

  calculatePercentage() {
    const price = this.createPackageForm.controls['packagePrice'].value;
    const discount = ((this.printerPrice - price) / this.printerPrice) * 100;
    this.createPackageForm.controls['packageDiscountPercentage'].setValue(
      Number(discount.toFixed(1)),
    );
  }

  calculatePrice() {
    const discount =
      this.createPackageForm.controls['packageDiscountPercentage'].value;
    const price = this.printerPrice * ((100 - discount) / 100);
    this.createPackageForm.controls['packagePrice'].setValue(price);
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.createPackageForm, field);
  }

  getFieldError(field: string): string | null {
    return this.validatorsService.getFieldError(this.createPackageForm, field);
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
          'error-snackbar',
        );
      },
    );
  }

  get packageIncludes() {
    return this.createPackageForm.get('packageIncludes') as FormArray;
  }

  onCheckboxChange(event: MatCheckboxChange, option: string): void {
    if (event.checked) {
      this.packageIncludes.push(this.fb.control(option));
    } else {
      const index = this.packageIncludes.controls.findIndex(x => x.value === option);
      this.packageIncludes.removeAt(index);
    }
  }

  addCustomOption(): void {
    const customOption = this.customOptionControl.value;
    if (customOption && !this.predefinedOptions.includes(customOption)) {
      this.predefinedOptions.push(customOption);
      this.packageIncludes.push(this.fb.control(customOption));
      this.customOptionControl.setValue(''); // Reset the input field
      this.showCustomOptionInput = false; // Hide the input field
    }
  }

  isChecked(option: string): boolean {
    return this.packageIncludes.controls.some(x => x.value === option);
  }

  toggleCustomOptionInput(): void {
    this.showCustomOptionInput = !this.showCustomOptionInput;
    if (!this.showCustomOptionInput) {
      this.customOptionControl.setValue(''); // Reset the input field if hiding
    }
  }

  submitForm(): void {
    // sets selected printer to printer uuid
    this.createPackageForm.controls['printer'].setValue(
      this.printerControl.value,
    );

    if (this.createPackageForm.invalid) {
      Object.keys(this.createPackageForm.controls).forEach((key) => {
        console.log(
          'Key = ' +
          key +
          ', Value = ' +
          this.createPackageForm.controls[key].value +
          ', Valid = ' +
          this.createPackageForm.controls[key].valid,
        );
      });
      console.log('invalid form');
      this.toastService.showError(
        'Por favor, llena todos los campos requeridos',
        'Error',
      );
      console.log(this.createPackageForm.errors);
      console.log(this.createPackageForm);
      console.log(this.createPackageForm.value);

      this.createPackageForm.markAllAsTouched();
      return;
    }

    // Remove customOption control if it exists
    if (this.createPackageForm.contains('customOption')) {
      this.createPackageForm.removeControl('customOption');
    }

    const formData = this.createPackageForm.value;

    this.isSubmitting = true;
    // gets id from printer name and creates package
    this.packageService.findPrinterIdByName(formData.printer).subscribe(
      (id) => {
        console.log(id);
        formData.printer = id;
        console.log(formData);
        this.packageService.createPackage(formData).subscribe(
          (response) => {
            this.toastService.showSuccess('Paquete de renta creado con éxito', 'OK');
            this.isSubmitting = false;
            this.router.navigate(['/website/packages']);
          },
          (error) => {
            console.log(error);
            this.isSubmitting = false;
            this.toastService.showError(
              'Hubo un error: ' +
              error.error.message +
              '. Por favor, intenta de nuevo.',
              'error-snackbar',
            );
          },
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
}
