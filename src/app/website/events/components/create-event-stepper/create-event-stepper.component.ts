// create-event-stepper.component.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormArray,
  FormBuilder,
  Validators,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { Observable, forkJoin, throwError } from 'rxjs';
import { map, startWith, switchMap, filter } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { EventService } from '../../services/event.service';
import { DealService } from 'src/app/website/deal/services/deal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { MatStepper } from '@angular/material/stepper';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-create-event-stepper',
  templateUrl: './create-event-stepper.component.html',
  styleUrls: ['./create-event-stepper.component.scss'],
})
export class CreateEventStepperComponent implements OnInit {
  isLinear = true;
  stepperOrientation!: Observable<'horizontal' | 'vertical'>;

  // Separate FormGroups for each step
  eventDetailsForm!: FormGroup; // FormGroup for Step 1: Create Event
  promotionsForm!: FormGroup; // FormGroup for Step 2: Create Promotions

  isSubmitting = false;

  // Arrays to store autocomplete observables per deal
  filteredProductNames: Observable<string[]>[] = [];
  dealTypes: string[] = [];

  @ViewChild('stepper') private stepper!: MatStepper;

  constructor(
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver,
    private eventService: EventService,
    private dealService: DealService,
    private toastService: ToastService,
    private router: Router, // Inject Router
  ) {
    this.stepperOrientation = this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(map(({ matches }) => (matches ? 'vertical' : 'horizontal')));
  }

  ngOnInit(): void {
    console.log('Initializing CreateEventStepperComponent...');
    this.initializeForms();
  }

  /**
   * Initializes the separate FormGroups for each step.
   */
  initializeForms(): void {
    console.log('Initializing forms...');
    // Initialize Step 1 FormGroup: Event Details
    this.eventDetailsForm = this.fb.group({
      title: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', Validators.required],
      image: [null, Validators.required],
    });

    // Initialize Step 2 FormGroup: Promotions (Deals)
    this.promotionsForm = this.fb.group({
      deals: this.fb.array([]),
    });
  }

  /**
   * Getter for promotions FormArray.
   */
  get deals(): FormArray {
    return this.promotionsForm.get('deals') as FormArray;
  }

  /**
   * Creates a new deal FormGroup.
   */
  createDeal(): FormGroup {
    console.log('Creating a new deal FormGroup...');
    return this.fb.group({
      type: ['multifuncional', Validators.required],
      selection: ['', Validators.required],
      // Removed Validators.required to fix the disabled warning
      printerPrice: [{ value: '', disabled: true }],
      price: ['', [Validators.required, Validators.min(0)]],
      dealCurrency: ['MXN', Validators.required],
      discountPercentage: [
        '',
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      description: ['', Validators.required],
    });
  }

  /**
   * Handles type change in a deal.
   * @param index Index of the deal in the FormArray.
   * @param event The change event from the mat-select.
   */
  onTypeChange(index: number, event: MatSelectChange): void {
    console.log(`Type changed for deal ${index + 1}: ${event.value}`);
    const dealGroup = this.deals.at(index) as FormGroup;
    const selectionControl = dealGroup.get('selection') as FormControl;

    // Reset selection and prices when type changes
    selectionControl.setValue('');
    dealGroup.get('printerPrice')?.setValue('');
    dealGroup.get('price')?.setValue('');
    this.dealTypes[index] = event.value;

    // Clear validators when switching type
    if (event.value === 'multifuncional') {
      dealGroup.get('printerPrice')?.setValidators(Validators.required);
    } else {
      dealGroup.get('printerPrice')?.clearValidators();
    }
    dealGroup.get('printerPrice')?.updateValueAndValidity();

    // Update autocomplete options based on type
    this.filteredProductNames[index] = selectionControl.valueChanges.pipe(
      startWith(''),
      switchMap((inputValue: string) => {
        return event.value === 'multifuncional'
          ? this.dealService.getAllPrinterNames()
          : this.dealService.getAllConsumiblesNames();
      }),
      switchMap((names: string[]) => {
        const currentValue = selectionControl.value || '';
        return this._filter(currentValue, names);
      }),
    );
  }

  /**
   * Adds a new deal to the promotions FormArray.
   */
  addDeal(): void {
    const dealIndex = this.deals.length;
    console.log(`Adding new deal at index ${dealIndex + 1}`);
    this.deals.push(this.createDeal());
    this.dealTypes.push('multifuncional'); // Default type
    this.setupProductNameAutocomplete(this.deals.length - 1);
  }

  /**
   * Removes a deal from the promotions FormArray.
   * @param index Index of the deal to remove.
   */
  removeDeal(index: number): void {
    console.log(`Removing deal at index ${index + 1}`);
    this.deals.removeAt(index);
    this.filteredProductNames.splice(index, 1);
    this.dealTypes.splice(index, 1);
  }

  /**
   * Sets up autocomplete for product names in a deal.
   * @param index Index of the deal in the FormArray.
   */
  setupProductNameAutocomplete(index: number): void {
    console.log(`Setting up autocomplete for deal ${index + 1}`);
    const dealGroup = this.deals.at(index) as FormGroup;
    const selectionControl = dealGroup.get('selection') as FormControl;

    this.filteredProductNames[index] = selectionControl.valueChanges.pipe(
      startWith(''),
      switchMap((value: string) => {
        const currentType = this.dealTypes[index] || 'multifuncional';
        return currentType === 'multifuncional'
          ? this.dealService.getAllPrinterNames()
          : this.dealService.getAllConsumiblesNames();
      }),
      switchMap((names: string[]) => {
        const currentValue = selectionControl.value || '';
        return this._filter(currentValue, names);
      }),
    );

    // Listen for selection changes to fetch price based on current type
    selectionControl.valueChanges
      .pipe(
        filter(
          (productName: string) =>
            !!productName && productName.trim().length > 0,
        ), // Only proceed if productName is valid
      )
      .subscribe((productName: string) => {
        const currentType = this.dealTypes[index] || 'multifuncional';
        console.log(
          `Autocomplete selection changed for deal ${
            index + 1
          }: ${productName} with type ${currentType}`,
        );
        if (currentType === 'multifuncional') {
          console.log(
            `Fetching printer price for deal ${index + 1}: ${productName}`,
          );
          this.dealService.getPrinterPrice(productName).subscribe(
            (price) => {
              console.log(
                `Retrieved printer price for deal ${index + 1}: $${price}`,
              );
              dealGroup.get('printerPrice')?.setValue(price);
              dealGroup.get('price')?.setValue(price);
            },
            (error) => {
              console.error(
                `Error fetching printer price for deal ${index + 1}:`,
                error,
              );
              const errorMessage =
                error?.error?.message ||
                'Error al obtener el precio de la impresora';
              this.toastService.showError(
                `Error al obtener el precio de la impresora: ${errorMessage}`,
                'Cerrar',
              );
            },
          );
        } else {
          console.log(
            `Fetching consumible price for deal ${index + 1}: ${productName}`,
          );
          this.dealService.getConsumiblePrice(productName).subscribe(
            (price) => {
              console.log(
                `Retrieved consumible price for deal ${index + 1}: $${price}`,
              );
              dealGroup.get('printerPrice')?.setValue(price);
              dealGroup.get('price')?.setValue(price);
            },
            (error) => {
              console.error(
                `Error fetching consumible price for deal ${index + 1}:`,
                error,
              );
              const errorMessage =
                error?.error?.message ||
                'Error al obtener el precio del consumible';
              this.toastService.showError(
                `Error al obtener el precio del consumible: ${errorMessage}`,
                'Cerrar',
              );
            },
          );
        }
      });
  }

  /**
   * Filters the autocomplete options based on user input.
   * @param value User input value.
   * @param options List of available options.
   */
  private _filter(value: string, options: string[]): Observable<string[]> {
    const filterValue = value.toLowerCase();
    const filtered = options.filter((option) =>
      option.toLowerCase().includes(filterValue),
    );
    return new Observable<string[]>((observer) => {
      observer.next(filtered);
      observer.complete();
    });
  }

  /**
   * Skips the promotions step and moves to the next step.
   */
  skipPromotions(): void {
    console.log('Skipping promotions step');
    this.stepper.next();
  }

  /**
   * Handles the image upload event.
   * @param event The uploaded image URL or File.
   */
  onFileUploaded(event: any): void {
    console.log('Image upload event:', event);
    const file = Array.isArray(event) ? event[0] : event; // Expecting a single file
    if (file) {
      // If 'file' is a File object, convert it to a URL for preview
      if (file instanceof File) {
        console.log('Uploading file:', file.name);
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          console.log('File read successfully:', result);
          this.eventDetailsForm.patchValue({ image: result });
        };
        reader.readAsDataURL(file);
      } else {
        // If 'file' is already a URL
        console.log('Using image URL:', file);
        this.eventDetailsForm.patchValue({ image: file });
      }
    }
  }

  /**
   * Removes the uploaded image from the form.
   */
  onRemoveImage(): void {
    console.log('Removing uploaded image');
    this.eventDetailsForm.patchValue({ image: null });
  }

  /**
   * Submits the form to create a new event along with its promotions.
   */
  onSubmit(): void {
    console.log('Submitting the form to create event and promotions...');
    // Validate both forms
    if (
      this.eventDetailsForm.invalid ||
      (this.deals.length > 0 && this.promotionsForm.invalid)
    ) {
      console.warn('Form is invalid. Marking all fields as touched.');
      this.eventDetailsForm.markAllAsTouched();
      this.promotionsForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const eventData: any = {
      title: this.eventDetailsForm.value.title,
      startDate: new Date(this.eventDetailsForm.value.startDate),
      endDate: new Date(this.eventDetailsForm.value.endDate),
      description: this.eventDetailsForm.value.description,
      image: this.eventDetailsForm.value.image,
      dealIds: [], // Will populate after creating deals
    };

    console.log('Event data prepared:', eventData);

    const dealsFormArray = this.deals.controls as FormGroup[];
    const createDealObservables: Observable<any>[] = [];

    if (dealsFormArray.length > 0) {
      console.log(`Creating ${dealsFormArray.length} deal(s)...`);
      // Create deals first
      dealsFormArray.forEach((dealGroup, index) => {
        const deal = dealGroup.value;
        const dealData: any = {
          // Removed 'printer' initialization
          dealStartDate: eventData.startDate.toISOString(),
          dealEndDate: eventData.endDate.toISOString(),
          dealPrice: Number(deal.price),
          dealCurrency: deal.dealCurrency,
          dealDiscountPercentage: Number(deal.discountPercentage),
          dealDescription: deal.description,
        };

        const dealType = this.dealTypes[index] || 'multifuncional';
        console.log(
          `Preparing to create deal ${index + 1} of type '${dealType}'`,
        );

        if (dealType === 'multifuncional') {
          // Find printer ID by name
          createDealObservables.push(
            this.dealService.findPrinterIdByName(deal.selection).pipe(
              switchMap((printerId: string) => {
                if (printerId) {
                  console.log(
                    `Found printer ID for deal ${index + 1}: ${printerId}`,
                  );
                  dealData.printer = printerId;
                  console.log(`Submitting deal ${index + 1}:`, dealData);
                  return this.dealService.submitDealCreateForm(dealData);
                } else {
                  console.error(
                    `Printer not found for deal ${index + 1}: ${
                      deal.selection
                    }`,
                  );
                  return throwError('Printer not found');
                }
              }),
            ),
          );
        } else {
          // Find consumible ID by name
          createDealObservables.push(
            this.dealService.findConsumibleIdByName(deal.selection).pipe(
              switchMap((consumibleId: string) => {
                if (consumibleId) {
                  console.log(
                    `Found consumible ID for deal ${
                      index + 1
                    }: ${consumibleId}`,
                  );
                  dealData.consumible = consumibleId;
                  console.log(`Submitting deal ${index + 1}:`, dealData);
                  return this.dealService.submitDealCreateForm(dealData);
                } else {
                  console.error(
                    `Consumible not found for deal ${index + 1}: ${
                      deal.selection
                    }`,
                  );
                  return throwError('Consumible not found');
                }
              }),
            ),
          );
        }
      });

      // After all deals are created, create the event and associate the deals
      forkJoin(createDealObservables).subscribe(
        (createdDeals) => {
          console.log('All deals created successfully:', createdDeals);
          const dealIds = createdDeals.map((deal) => deal.id);
          eventData.dealIds = dealIds; // Use dealIds instead of deals

          // Console log the eventData before creating the event
          console.log('Submitting event data with deal IDs:', eventData);

          // Now create the event with associated deal IDs
          this.createEvent(eventData);
        },
        (error) => {
          console.error('Error creating deals:', error);
          this.isSubmitting = false;
          const errorMessage =
            typeof error === 'string' ? error : 'Error creando las promociones';
          this.toastService.showError(
            `Error creando las promociones: ${errorMessage}`,
            'Cerrar',
          );
        },
      );
    } else {
      console.log('No deals to create. Proceeding to create the event.');
      // No deals to create, proceed to create the event
      this.createEvent(eventData);
    }
  }

  /**
   * Creates the event and associates the deals.
   * @param eventData The event data to submit.
   */
  createEvent(eventData: any): void {
    console.log('Creating event with data:', eventData);
    // Console log the eventData
    console.log('Submitting event data:', eventData);

    this.eventService.create(eventData).subscribe(
      () => {
        console.log('Event created successfully.');
        this.isSubmitting = false;
        this.toastService.showSuccess(
          'Evento y promociones creados exitosamente',
          'Cerrar',
        );
        // Navigate to /website/events
        this.router.navigate(['/website/events']);
      },
      (error) => {
        console.error('Error creating event:', error);
        this.isSubmitting = false;
        const errorMessage = error?.error?.message || 'Error creando el evento';
        this.toastService.showError(
          `Error creando el evento: ${errorMessage}`,
          'Cerrar',
        );
      },
    );
  }

  /**
   * Checks if a form field is valid.
   * @param formGroup The form group containing the field.
   * @param field The field name.
   * @returns True if the field is invalid and touched or dirty.
   */
  isValidField(formGroup: AbstractControl, field: string): boolean {
    const control = formGroup.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Retrieves the error message for a form field.
   * @param formGroup The form group containing the field.
   * @param field The field name.
   * @returns The error message string.
   */
  getFieldError(formGroup: AbstractControl, field: string): string {
    const controlErrors = formGroup.get(field)?.errors;
    if (controlErrors?.['required']) {
      return 'Este campo es requerido';
    }
    if (controlErrors?.['min']) {
      return 'El valor debe ser positivo';
    }
    if (controlErrors?.['max']) {
      return 'El valor no puede exceder 100';
    }
    return '';
  }

  /**
   * Calculates the discount percentage based on the deal price.
   * @param index Index of the deal in the FormArray.
   */
  calculatePercentage(index: number): void {
    console.log(`Calculating discount percentage for deal ${index + 1}`);
    const dealGroup = this.deals.at(index) as FormGroup;
    const price = Number(dealGroup.get('price')?.value);
    const originalPrice = Number(dealGroup.get('printerPrice')?.value);

    console.log(`Original Price: $${originalPrice}, Deal Price: $${price}`);

    if (originalPrice > 0) {
      const discount = ((originalPrice - price) / originalPrice) * 100;
      const roundedDiscount = Math.round(discount);
      console.log(`Calculated Discount: ${roundedDiscount}%`);
      dealGroup.get('discountPercentage')?.setValue(roundedDiscount);
    } else {
      console.warn(
        'Original price is zero or negative. Cannot calculate discount.',
      );
    }
  }

  /**
   * Calculates the deal price based on the discount percentage.
   * @param index Index of the deal in the FormArray.
   */
  calculatePrice(index: number): void {
    console.log(
      `Calculating deal price based on discount for deal ${index + 1}`,
    );
    const dealGroup = this.deals.at(index) as FormGroup;
    const discountPercentage = Number(
      dealGroup.get('discountPercentage')?.value,
    );
    const originalPrice = Number(dealGroup.get('printerPrice')?.value);

    console.log(
      `Original Price: $${originalPrice}, Discount Percentage: ${discountPercentage}%`,
    );

    if (discountPercentage >= 0 && discountPercentage <= 100) {
      const discountAmount = (originalPrice * discountPercentage) / 100;
      const dealPrice = originalPrice - discountAmount;
      console.log(`Calculated Deal Price: $${dealPrice.toFixed(2)}`);
      dealGroup.get('price')?.setValue(dealPrice.toFixed(2));
    } else {
      console.warn(
        'Invalid discount percentage. It must be between 0 and 100.',
      );
    }
  }
}
