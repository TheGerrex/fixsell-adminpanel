import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { DealService } from '../../services/deal.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Printer } from 'src/app/website/interfaces/printer.interface';

import { ToastService } from 'src/app/shared/services/toast.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { Deal } from 'src/app/website/interfaces/deal.interface';
@Component({
  selector: 'app-deal-edit',
  templateUrl: './deal-edit.component.html',
  styleUrls: ['./deal-edit.component.scss'],
})
export class DealEditComponent implements OnInit {
  deal: Deal | null = null;
  isLoadingData = false;
  isSubmitting = false;
  public editDealForm!: FormGroup;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private dealService: DealService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private validatorsService: ValidatorsService
  ) {
    this.editDealForm = this.fb.group({
      printer: ['', Validators.required],
      printerPrice: ['', Validators.required],
      dealStartDate: ['', Validators.required],
      dealEndDate: ['', Validators.required],
      dealPrice: ['', Validators.required],
      dealCurrency: ['', Validators.required],
      dealDiscountPercentage: ['', Validators.required],
      dealDescription: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getDeal();
  }

  formatDate(date: any): string {
    let dateObject = new Date(date);
    let year = dateObject.getUTCFullYear();
    let month = ('0' + (dateObject.getUTCMonth() + 1)).slice(-2); // Months are 0-based, so +1 and pad with 0
    let day = ('0' + dateObject.getUTCDate()).slice(-2); // Pad with 0
    return `${year}-${month}-${day}`; // "yyyy-MM-dd"
  }

  initializeForm() {
    this.editDealForm = this.fb.group({
      printer: [
        { value: this.deal ? this.deal.printer.model : '', disabled: true },
      ],
      printerPrice: [
        { value: this.deal ? this.deal.printer.price : '', disabled: true },
      ],
      dealStartDate: [
        this.deal ? this.formatDate(this.deal.dealStartDate) : '',
        Validators.required,
      ],

      dealEndDate: [
        this.deal ? this.formatDate(this.deal.dealEndDate) : '',
        Validators.required,
      ],

      dealPrice: [this.deal ? this.deal.dealPrice : '', Validators.required],
      dealCurrency: [
        this.deal ? this.deal.dealCurrency : '',
        Validators.required,
      ],
      dealDiscountPercentage: [
        this.deal ? this.deal.dealDiscountPercentage : '',
        Validators.required,
      ],
      dealDescription: [
        this.deal ? this.deal.dealDescription : '',
        Validators.required,
      ],
    });
  }

  getDeal(): void {
    this.isLoadingData = true;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dealService.getDeal(id).subscribe((dealResponse) => {
        console.log('dealResponse:', dealResponse);
        this.deal = dealResponse;
        this.initializeForm(); // Move this inside the subscribe block
        console.log(this.editDealForm);
        this.sharedService.changeDealName(dealResponse.dealName);  
        this.isLoadingData = false;
      });
    }
  }

  logFormData() {
    console.log(this.editDealForm.value);
  }

  calculatePrice() {
    if (this.editDealForm.get('dealDiscountPercentage')?.value) {
      const discount =
        Number(this.editDealForm.get('printerPrice')?.value) *
        (Number(this.editDealForm.get('dealDiscountPercentage')?.value) / 100);
      this.editDealForm
        .get('dealPrice')
        ?.setValue(
          (
            Number(this.editDealForm.get('printerPrice')?.value) - discount
          ).toString()
        ); // Convert the calculated price to a string
    }
  }

  calculatePercentage() {
    if (this.editDealForm.get('dealPrice')?.value) {
      const discount =
        Number(this.editDealForm.get('printerPrice')?.value) -
        Number(this.editDealForm.get('dealPrice')?.value); // Convert the deal price value to a number
      const percentage =
        (discount / Number(this.editDealForm.get('printerPrice')?.value)) * 100;
      this.editDealForm
        .get('dealDiscountPercentage')
        ?.setValue(percentage.toFixed(0).toString()); // Convert the percentage to a string
    }
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.editDealForm, field);
  }

  getFieldError(field: string): string | null {
    if (!this.editDealForm.controls[field]) return null;

    const errors = this.editDealForm.controls[field].errors || {};

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

  submitForm() {
    if (this.editDealForm.invalid) {
      this.editDealForm.markAllAsTouched();
      return;
    }
    let formData = this.editDealForm.value;
    const dealId = this.route.snapshot.paramMap.get('id');
    if (dealId === null) {
      console.error('Deal id is null');
      return;
    }

    // Convert dealPrice and dealDiscountPercentage to numbers
    formData = {
      ...formData,
      dealPrice: parseFloat(formData.dealPrice),
      dealDiscountPercentage: parseFloat(formData.dealDiscountPercentage),
    };
    this.isSubmitting = true;
    this.dealService.submitDealEditForm(formData, dealId).subscribe(
      (response) => {
        console.log('Response:', response);
        this.toastService.showSuccess('Deal updated successfully', 'OK'); // Show success toast
        this.router.navigate(['/website/deals']);
        this.isSubmitting = false;
      },
      (error) => {
        console.error('Error:', error);
        this.toastService.showError('Error updating deal', 'OK'); // Show error toast
        this.isSubmitting = false;
      }
    );
  }
}
