import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { ToastService } from './../../../../shared/services/toast.service';
import { PackageService } from '../../services/package.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';

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
  public package: any;

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
    const id = this.route.snapshot.paramMap.get('id');
    console.log(id);
    if (id) {
      console.log('getting package' + id);
      this.PackageService.getPackage(id).subscribe((packages) => {
        console.log('got package from service' + { packages });
        console.log({ packages });
        this.package = packages;
        this.printerPrice = this.package.printer.price; // set the printer price
        this.initalizeForm();
        console.log(packages);
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
      packageDuration: [
        this.package ? this.package.packageDuration : null,
        [Validators.required, Validators.min(1)],
      ],
      packageStartDate: [
        this.package
          ? this.datePipe.transform(this.package.packageStartDate, 'yyyy-MM-dd')
          : '',
        Validators.required,
      ],
      packageEndDate: [
        this.package
          ? this.datePipe.transform(this.package.packageEndDate, 'yyyy-MM-dd')
          : '',
        Validators.required,
      ],
      packagePrice: [
        this.package ? this.package.packagePrice : 0,
        [Validators.required, Validators.min(0.01)],
      ],
      packageDiscountPercentage: [
        this.package ? this.package.packageDiscountPercentage : 0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      packageDescription: [
        this.package ? this.package.packageDescription : '',
        Validators.required,
      ],
      packagePrints: [
        this.package ? this.package.packagePrints : 0,
        [Validators.required, Validators.min(1)],
      ],
      packageExtraClickPrice: [
        this.package ? this.package.packageExtraClickPrice : 0,
        [Validators.required, Validators.min(0.01)],
      ],
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

  submitForm(): void {
    if (this.editPackageForm.invalid) {
      this.toastService.showError(
        'Please fill all the required fields',
        'Error'
      );
      this.editPackageForm.markAllAsTouched();
      return;
    }

    const formData = this.editPackageForm.value;

    this.PackageService.updatePackage(this.package.id, formData).subscribe(
      (response) => {
        this.toastService.showSuccess('Package updated successfully', 'OK'); // Show success toast
        this.router.navigate(['/website/packages']);
      },
      (error) => {
        console.log(error);
        this.toastService.showError(
          'There was an error: ' + error.error.message + '. Please try again.',
          'error-snackbar'
        );
      }
    );
  }
}
