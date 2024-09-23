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
import { Observable } from 'rxjs';
import { ToastService } from './../../../../shared/services/toast.service';
import { PackageService } from '../../services/package.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { Printer } from 'src/app/website/interfaces/printer.interface';
import { MatCheckboxChange } from '@angular/material/checkbox';

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
  selectedPrinter!: Printer;
  customOptionControl: FormControl = new FormControl();
  allOptions: string[] = [];
  printerNameControl = new FormControl();
  filteredPrinterNames: Observable<string[]> | undefined;

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
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private PackageService: PackageService,
    private validatorsService: ValidatorsService,
    private datePipe: DatePipe,
  ) { }

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
        this.selectedPrinter = this.package.printer; // set the selected printer
        this.printerPrice = this.package.printer.price; // set the printer price
        this.printerBrand = this.package.printer.brand; // set the printer brand
        this.initalizeForm();
        this.mergeOptions(this.package.packageIncludes);
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
      packageMonthlyPrice: [
        this.package ? this.package.packageMonthlyPrice : 0,
        [Validators.required, Validators.min(0.01)],
      ],
      packageCurrency: [
        this.package ? this.package.packageCurrency : 'MXN',
        Validators.required,
      ],
      packageDiscountPercentage: [
        this.package ? this.package.packageDiscountPercentage : 0,
      ],
      packageDescription: [this.package ? this.package.packageDescription : ''],
      packageDepositPrice: [
        this.package ? this.package.packageDepositPrice : 0,
      ],
      packagePrintsBw: [this.package ? this.package.packagePrintsBw : 0],
      packagePrintsColor: [this.package ? this.package.packagePrintsColor : 0],
      packageExtraClickPriceBw: [
        this.package ? this.package.packageExtraClickPriceBw : 0,
      ],
      packageExtraClickPriceColor: [
        this.package ? this.package.packageExtraClickPriceColor : 0,
      ],
      packageIncludes: this.fb.array(
        this.package ? this.package.packageIncludes : [],
      ),
    });
  }

  mergeOptions(customOptions: string[]): void {
    const allOptionsSet = new Set([...this.predefinedOptions, ...customOptions]);
    this.allOptions = Array.from(allOptionsSet);
  }

  get packageIncludes() {
    return this.editPackageForm.get('packageIncludes') as FormArray;
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
    if (customOption && !this.allOptions.includes(customOption)) {
      this.allOptions.push(customOption);
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

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.editPackageForm, field);
  }

  getFieldError(field: string): string | null {
    return this.validatorsService.getFieldError(this.editPackageForm, field);
  }

  submitForm(): void {
    if (this.editPackageForm.invalid) {
      this.toastService.showError(
        'Please fill all the required fields',
        'Error',
      );
      this.editPackageForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const formData = {
      ...this.editPackageForm.value,
      packageMonthlyPrice: Number(this.editPackageForm.value.packageMonthlyPrice),
      packageExtraClickPriceBw: Number(this.editPackageForm.value.packageExtraClickPriceBw),
      packageDepositPrice: Number(this.editPackageForm.value.packageDepositPrice),
      packagePrintsBw: Number(this.editPackageForm.value.packagePrintsBw),
      packagePrintsColor: Number(this.editPackageForm.value.packagePrintsColor),
      packageExtraClickPriceColor: Number(this.editPackageForm.value.packageExtraClickPriceColor),
      packageDiscountPercentage: Number(this.editPackageForm.value.packageDiscountPercentage),
    };

    this.PackageService.updatePackage(this.package.id, formData).subscribe(
      (response) => {
        this.isSubmitting = false;
        this.toastService.showSuccess('Paquete de renta actualizado con éxito', 'OK'); // Show success toast
        this.router.navigate(['/website/packages']);
      },
      (error) => {
        this.isSubmitting = false;
        console.log(error);
        this.toastService.showError(
          'Hubo un error: ' + error.error.message + '. Por favor, intenta de nuevo.',
          'error-snackbar',
        );
      },
    );
  }
}
('');
