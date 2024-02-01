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
import { Consumible } from 'src/app/website/interfaces/consumibles.interface';
import { FileUploadComponent } from 'src/app/shared/components/file-upload/file-upload.component';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PackageService } from '../../services/package.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { PrinterService } from '../../../printer/services/printer.service';
import {
  Observable,
  map,
  startWith,
  combineLatest,
  switchMap,
  of,
  from,
} from 'rxjs';

@Component({
  selector: 'app-package-create',
  templateUrl: './package-create.component.html',
  styleUrls: ['./package-create.component.scss'],
})
export class PackageCreateComponent implements OnInit {
  public createPackageForm!: FormGroup;
  printerNames$: Observable<string[]> = new Observable<string[]>();
  filteredPrinterNames$: Observable<string[]> | undefined;
  printerControl = new FormControl();
  printerPrice: number = 0;
  constructor(
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private validatorsService: ValidatorsService,
    private PackageService: PackageService
  ) {}

  ngOnInit(): void {
    this.initalizeForm();
    this.printerNames$ = this.PackageService.getAllPrinterNames();

    // Use the _filter function inside the map operator
    this.filteredPrinterNames$ = this.createPackageForm
      .get('printer')!
      .valueChanges.pipe(
        startWith(''),
        switchMap((value) => from(this._filter(value))) // Convert Promise<string[]> to Observable<string[]>
      );

    // Subscribe to the valueChanges event of the printerControl
    this.printerControl.valueChanges.subscribe((selectedPrinter) => {
      // Fetch the price of the selected printer and store it in the printerPrice variable
      this.PackageService.getPrinterPrice(selectedPrinter).subscribe(
        (price) => {
          this.printerPrice = price;
        }
      );
    });
  }

  private async _filter(value: string): Promise<string[]> {
    const filterValue = value.toLowerCase();
    const printerNames = await this.printerNames$.toPromise();
    return (
      printerNames?.filter((printerName) =>
        printerName.toLowerCase().includes(filterValue)
      ) ?? []
    );
  }

  initalizeForm() {
    this.createPackageForm = this.fb.group({
      printer: ['', Validators.required],
      packageDuration: [null, [Validators.required, Validators.min(1)]],
      packageStartDate: ['', Validators.required],
      packageEndDate: ['', Validators.required],
      packagePrice: [0, [Validators.required, Validators.min(0.01)]],
      packageDiscountPercentage: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      packageDescription: ['', Validators.required],
      packagePrints: [0, [Validators.required, Validators.min(1)]],
      packageExtraClickPrice: [0, [Validators.required, Validators.min(0.01)]],
    });
  }

  calculatePercentage() {
    const price = this.createPackageForm.controls['packagePrice'].value;
    const discount = ((this.printerPrice - price) / this.printerPrice) * 100;
    this.createPackageForm.controls['packageDiscountPercentage'].setValue(
      discount
    );
  }

  calculatePrice() {
    const discount =
      this.createPackageForm.controls['packageDiscountPercentage'].value;
    const price = this.printerPrice * ((100 - discount) / 100);
    this.createPackageForm.controls['packagePrice'].setValue(price);
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
    // gets id from printer name and creates package
    this.PackageService.findPrinterIdByName(formData.printer).subscribe(
      (id) => {
        console.log(id);
        formData.printer = id;
        // this.createPackage(formData);
        console.log(formData);
        this.PackageService.createPackage(formData).subscribe(
          (response) => {
            this.toastService.showSuccess('Package created successfully', 'OK'); // Show success toast
            this.router.navigate(['/website/packages']);
          },
          (error) => {
            console.log(error);
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

    // formData.price = parseFloat(formData.price);
    // formData.weight = parseFloat(formData.weight);
    // formData.stock = parseInt(formData.stock);
  }
}
