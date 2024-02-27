import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Deal, Printer } from '../../../interfaces/printer.interface';
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
import { Observable } from 'rxjs';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-deal-create',
  templateUrl: './deal-create.component.html',
  styleUrls: ['./deal-create.component.scss'],
})
export class DealCreateComponent implements OnInit {
  public createDealForm!: FormGroup;
  deal: Deal | null = null;
  isLoadingForm = false;

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
  }

  private _filter(value: string, printerNames: string[]): string[] {
    const filterValue = value.toLowerCase();
    return printerNames.filter((printerName) =>
      printerName.toLowerCase().includes(filterValue)
    );
  }

  initializeForm() {
    this.createDealForm = this.fb.group({
      printer: ['', Validators.required],
      printerPrice: [{ value: '', disabled: true }, Validators.required],
      dealStartDate: ['', Validators.required],
      dealEndDate: ['', Validators.required],
      dealPrice: ['', Validators.required],
      dealCurrency: ['', Validators.required],
      dealDiscountPercentage: ['', Validators.required],
      dealDescription: ['', Validators.required],
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

  submitForm() {}
}
