import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  FormArray,
} from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { ToastService } from './../../../../shared/services/toast.service';
import { PackageService } from '../../services/package.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-package-edit',
  templateUrl: './package-edit.component.html',
  styleUrls: ['./package-edit.component.scss'],
  providers: [DatePipe],
})
export class PackageEditComponent implements OnInit {
  public editPackageForm!: FormGroup;
  printerNames$: Observable<string[]> = new Observable<string[]>();
  filteredPrinterNames$: Observable<string[]> | undefined;
  printerControl = new FormControl();
  printerPrice: number = 0;
  printerBrand: string = '';
  public package: any;
  isLoadingData = false;
  isSubmitting = false;

  printerNameControl = new FormControl();
  filteredPrinterNames: Observable<string[]> | undefined;

  constructor(
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private PackageService: PackageService,
    private validatorsService: ValidatorsService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.getPackage();
  }

  getPackage() {
    this.isLoadingData = true;
    const id = this.route.snapshot.paramMap.get('id');
    console.log(id);
    if (id) {
      console.log('getting package' + id);
      this.PackageService.getPackage(id).subscribe((packages) => {
        console.log('got package from service' + { packages });
        console.log({ packages });
        this.package = packages;
        this.printerPrice = this.package.printer.price; // set the printer price
        this.printerBrand = this.package.printer.brand; // set the printer brand
        this.initalizeForm();
        console.log(packages);
        this.isLoadingData = false;
      });
    }
  }

  initalizeForm() {
    console.log('initializing form');
    this.editPackageForm = this.fb.group({
      printer: [
        {
          value: this.package ? this.package.printer.model : '',
          disabled: true,
        },
        Validators.required,
      ],
      packageDuration: [this.package ? this.package.packageDuration : null],
      packageStartDate: [
        this.package
          ? this.datePipe.transform(this.package.packageStartDate, 'yyyy-MM-dd')
          : '',
      ],
      packageEndDate: [
        this.package
          ? this.datePipe.transform(this.package.packageEndDate, 'yyyy-MM-dd')
          : '',
      ],
      packagePrice: [
        this.package ? this.package.packagePrice : 0,
        [Validators.required, Validators.min(0.01)],
      ],
      packageCurrency: [
        this.package ? this.package.packageCurrency : 'USD',
        Validators.required,
      ],
      packageDiscountPercentage: [
        this.package ? this.package.packageDiscountPercentage : 0,
      ],
      packageDescription: [this.package ? this.package.packageDescription : ''],
      packagePrints: [this.package ? this.package.packagePrints : 0],
      packageExtraClickPrice: [
        this.package ? this.package.packageExtraClickPrice : 0,
      ],
      packageIncludes: this.fb.array(
        this.package ? this.package.packageIncludes : []
      ),
    });
  }
  calculatePercentage() {
    const price = this.editPackageForm.controls['packagePrice'].value;
    const discount = ((this.printerPrice - price) / this.printerPrice) * 100;
    this.editPackageForm.controls['packageDiscountPercentage'].setValue(
      discount
    );
  }

  calculatePrice() {
    const discount =
      this.editPackageForm.controls['packageDiscountPercentage'].value;
    const price = this.printerPrice * ((100 - discount) / 100);
    this.editPackageForm.controls['packagePrice'].setValue(price);
  }

  get packageIncludesControls() {
    return (this.editPackageForm.get('packageIncludes') as FormArray).controls;
  }

  addInclude() {
    (this.editPackageForm.get('packageIncludes') as FormArray).push(
      new FormControl('')
    );
  }

  removeInclude(index: number) {
    (this.editPackageForm.get('packageIncludes') as FormArray).removeAt(index);
  }

  isValidField(field: string): boolean | null {
    // console.log(this.validatorsService.isValidField(this.createPrinterForm, field))
    return this.validatorsService.isValidField(this.editPackageForm, field);
  }

  getFieldError(field: string): string | null {
    if (!this.editPackageForm.controls[field]) return null;

    const errors = this.editPackageForm.controls[field].errors || {};

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
    if (this.editPackageForm.invalid) {
      this.toastService.showError(
        'Please fill all the required fields',
        'Error'
      );
      this.editPackageForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const formData = {
      ...this.editPackageForm.value,
      packagePrice: Number(this.editPackageForm.value.packagePrice),
      packageDiscountPercentage: Number(
        this.editPackageForm.value.packageDiscountPercentage
      ),
      packageExtraClickPrice: Number(
        this.editPackageForm.value.packageExtraClickPrice
      ),
    };

    this.PackageService.updatePackage(this.package.id, formData).subscribe(
      (response) => {
        this.isSubmitting = false;
        this.toastService.showSuccess('Package updated successfully', 'OK'); // Show success toast
        this.router.navigate(['/website/packages']);
      },
      (error) => {
        this.isSubmitting = false;
        console.log(error);
        this.toastService.showError(
          'There was an error: ' + error.error.message + '. Please try again.',
          'error-snackbar'
        );
      }
    );
  }
}
('');
