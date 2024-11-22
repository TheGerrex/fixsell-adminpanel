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
import { map, startWith, switchMap, filter, catchError } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { EventService } from '../../services/event.service';
import { DealService } from 'src/app/website/deal/services/deal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { MatStepper } from '@angular/material/stepper';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router'; // Import Router
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';
@Component({
  selector: 'app-edit-event-stepper',
  templateUrl: './edit-event-stepper.component.html',
  styleUrls: ['./edit-event-stepper.component.scss'],
})
export class EditEventStepperComponent implements OnInit {
  isLinear = true;
  stepperOrientation!: Observable<'horizontal' | 'vertical'>;

  // Separate FormGroups for each step
  eventDetailsForm!: FormGroup; // FormGroup for Step 1: Create Event
  promotionsForm!: FormGroup; // FormGroup for Step 2: Create Promotions
  initialDealIds: string[] = [];
  isSubmitting = false;

  originalImage: string = '';

  // Arrays to store autocomplete observables per deal
  filteredProductNames: Observable<string[]>[] = [];
  dealTypes: string[] = [];

  // to store the event id
  eventId!: string;
  @ViewChild('stepper') private stepper!: MatStepper;

  constructor(
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver,
    private eventService: EventService,
    private dealService: DealService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute, // Inject ActivatedRoute
  ) {
    this.stepperOrientation = this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(map(({ matches }) => (matches ? 'vertical' : 'horizontal')));
  }

  ngOnInit(): void {
    console.log('Initializing EditEventStepperComponent...');
    this.initializeForms();
    // Get the event ID from the route parameters
    this.eventId = this.route.snapshot.paramMap.get('id')!;
    console.log(`Retrieved eventId: ${this.eventId}`);

    if (!this.eventId) {
      console.error('Event ID is undefined. Cannot proceed with editing.');
      this.toastService.showError('Invalid event ID.', 'Close');
      // Optionally, navigate away or handle the error appropriately
      return;
    }

    // Fetch the existing event data
    this.loadEventData();
  }

  /**
   * Fetches the existing event data and populates the form.
   * @returns void
   * */
  loadEventData(): void {
    this.eventService.findOne(this.eventId).subscribe(
      (event) => {
        console.log('Fetched event:', event);

        // Verify the structure of event.deals
        console.log('Type of event.deals:', typeof event.deals);
        console.log('Is event.deals an array?', Array.isArray(event.deals));
        console.log('event.deals content:', event.deals);

        // Populate event details form
        this.eventDetailsForm.patchValue({
          title: event.title,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          description: event.description,
          image: event.image,
        });

        // Store the original image URL
        this.originalImage = event.image;
        console.log('Original image set to:', this.originalImage);

        // Initialize initialDealIds as an array of strings
        if (Array.isArray(event.deals) && event.deals.length > 0) {
          const dealsAreObjects =
            typeof event.deals[0] === 'object' && event.deals[0] !== null;

          this.initialDealIds = dealsAreObjects
            ? event.deals.map((deal: any) => {
                console.log('Deal object:', deal);
                return deal.id.toString();
              })
            : event.deals;

          console.log('Initial deal IDs:', this.initialDealIds);

          // Fetch each deal using its ID
          const dealObservables = this.initialDealIds.map((dealId: string) => {
            console.log(`Fetching deal with ID: ${dealId}`);
            return this.dealService.getDeal(dealId).pipe(
              catchError((error) => {
                console.error(`Error fetching deal with ID ${dealId}:`, error);
                this.toastService.showError(
                  `Error fetching deal with ID ${dealId}: ${error.message}`,
                  'Cerrar',
                );
                return of(null); // Continue with other deals
              }),
            );
          });

          forkJoin(dealObservables).subscribe(
            (deals) => {
              console.log('Fetched deals:', deals);
              deals.forEach((deal, index) => {
                if (deal) {
                  console.log(`Processing deal ${index + 1}:`, deal);
                  const dealGroup = this.createDeal();

                  // Determine deal type and selection based on available properties
                  let type = 'consumible';
                  let selection = '';
                  let printerPrice = '';

                  if (deal.printer) {
                    type = 'multifuncional';
                    selection = deal.printer.model;
                    printerPrice = deal.printer.price;
                  } else if (deal.consumible) {
                    type = 'consumible';
                    selection = deal.consumible.name;
                    printerPrice = deal.consumible.price;
                  } else {
                    console.warn(
                      `Deal ${
                        index + 1
                      } lacks 'printer' and 'consumible' properties.`,
                    );
                  }

                  // Populate deal form group with fetched data, including the deal ID
                  dealGroup.patchValue({
                    id: deal.id.toString(),
                    type: type,
                    selection: selection,
                    printerPrice: printerPrice,
                    price: deal.dealPrice,
                    dealCurrency: deal.dealCurrency,
                    discountPercentage: deal.dealDiscountPercentage,
                    description: deal.dealDescription,
                  });

                  this.deals.push(dealGroup);
                  this.dealTypes.push(type);
                  this.setupProductNameAutocomplete(index);
                  console.log(`Deal ${index + 1} added to FormArray.`);
                } else {
                  console.warn(
                    `Deal at index ${index + 1} is undefined or null.`,
                  );
                }
              });

              console.log(
                'Deals FormArray after loading:',
                this.deals.controls,
              );

              // Final check: If no deals are added
              if (this.deals.length === 0) {
                console.log('No valid deals added to the FormArray.');
              }
            },
            (error) => {
              console.error('Error fetching deals:', error);
              this.toastService.showError('Error loading deals', 'Close');
            },
          );
        } else {
          console.log('No deals associated with this event.');
        }
      },
      (error) => {
        console.error('Error fetching event data:', error);
        this.toastService.showError('Error loading event data', 'Close');
      },
    );
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
    return this.fb.group({
      id: [''], // Add the id control to keep track of deal IDs
      type: ['multifuncional', Validators.required],
      selection: ['', Validators.required],
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
   * Submits the form to update the event along with its promotions.
   */
  onSubmit(): void {
    if (
      this.eventDetailsForm.invalid ||
      (this.deals.length > 0 && this.promotionsForm.invalid)
    ) {
      this.eventDetailsForm.markAllAsTouched();
      this.promotionsForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    // **Retrieve current image from the form**
    const currentImage: string = this.eventDetailsForm.value.image;

    // **Prepare eventData without the image by default**
    const eventData: any = {
      title: this.eventDetailsForm.value.title,
      startDate: new Date(this.eventDetailsForm.value.startDate),
      endDate: new Date(this.eventDetailsForm.value.endDate),
      description: this.eventDetailsForm.value.description,
      // image is conditionally added below
    };

    // **Compare and include image only if it has changed**
    if (currentImage !== this.originalImage) {
      eventData.image = currentImage;
      console.log('Image has changed. Including in submission:', currentImage);
    } else {
      console.log('Image has not changed. Excluding from submission.');
    }

    // **Log Event Data**
    console.log('Submitting Event Data:', eventData);

    const dealsFormArray = this.deals.controls as FormGroup[];
    const dealObservables: Observable<any>[] = [];

    // Collect IDs of existing deals from the form
    const currentDealIds: string[] = dealsFormArray
      .map((dealGroup) => dealGroup.value.id)
      .filter((id) => typeof id === 'string' && id.trim() !== '');

    console.log('Current Deal IDs:', currentDealIds);

    // Determine which deals have been removed
    const dealsToDelete = this.initialDealIds.filter(
      (id) => !currentDealIds.includes(id),
    );

    console.log('Deals to delete:', dealsToDelete);

    // **Delete removed deals within onSubmit**
    const deleteObservables = dealsToDelete.map((dealId: string) => {
      console.log(`Deleting Deal ID: ${dealId}`);
      return this.dealService.deleteDealById(dealId).pipe(
        catchError((error) => {
          console.error(`Failed to delete Deal ID: ${dealId}`, error);
          this.toastService.showError(
            `Error al eliminar la oferta con ID ${dealId}: ${error.message}`,
            'Cerrar',
          );
          return of(null); // Continue with other deletions
        }),
      );
    });

    // Handle deals: update existing or create new ones
    dealsFormArray.forEach((dealGroup, index) => {
      const deal = dealGroup.value;
      console.log(`Processing Deal ${index + 1}:`, deal);

      const dealData: any = {
        dealStartDate: eventData.startDate.toISOString(),
        dealEndDate: eventData.endDate.toISOString(),
        dealPrice: Number(deal.price),
        dealCurrency: deal.dealCurrency,
        dealDiscountPercentage: Number(deal.discountPercentage),
        dealDescription: deal.description,
        // Removed eventId as it's not needed
      };

      // **Log Deal Data Before Submission**
      console.log(`Deal ${index + 1} Data:`, dealData);

      const dealType = this.dealTypes[index] || 'multifuncional';

      if (dealType === 'multifuncional') {
        // Find printer ID by name
        dealObservables.push(
          this.dealService.findPrinterIdByName(deal.selection).pipe(
            switchMap((printerId: string) => {
              if (printerId) {
                dealData.printer = printerId;

                if (deal.id) {
                  // Update existing deal
                  console.log(`Updating Deal ID: ${deal.id}`);
                  return this.dealService
                    .submitDealEditForm(dealData, deal.id)
                    .pipe(map(() => deal.id.toString())); // Convert to string
                } else {
                  // Create new deal
                  console.log('Creating new deal');
                  return this.dealService
                    .submitDealCreateForm(dealData)
                    .pipe(map((newDeal) => newDeal.id.toString())); // Convert to string
                }
              } else {
                console.error(
                  'Printer not found for selection:',
                  deal.selection,
                );
                this.toastService.showError(
                  `Printer not found for selection: ${deal.selection}`,
                  'Cerrar',
                );
                return throwError(() => new Error('Printer not found'));
              }
            }),
            catchError((error) => {
              console.error(`Error processing Deal ${index + 1}:`, error);
              this.toastService.showError(
                `Error procesando la oferta ${index + 1}: ${error.message}`,
                'Cerrar',
              );
              return of(null); // Continue with other deals
            }),
          ),
        );
      } else {
        // Find consumible ID by name
        dealObservables.push(
          this.dealService.findConsumibleIdByName(deal.selection).pipe(
            switchMap((consumibleId: string) => {
              if (consumibleId) {
                dealData.consumible = consumibleId;

                if (deal.id) {
                  // Update existing deal
                  console.log(`Updating Deal ID: ${deal.id}`);
                  return this.dealService
                    .submitDealEditForm(dealData, deal.id)
                    .pipe(map(() => deal.id.toString())); // Convert to string
                } else {
                  // Create new deal
                  console.log('Creating new deal');
                  return this.dealService
                    .submitDealCreateForm(dealData)
                    .pipe(map((newDeal) => newDeal.id.toString())); // Convert to string
                }
              } else {
                console.error(
                  'Consumible not found for selection:',
                  deal.selection,
                );
                this.toastService.showError(
                  `Consumible not found for selection: ${deal.selection}`,
                  'Cerrar',
                );
                return throwError(() => new Error('Consumible not found'));
              }
            }),
            catchError((error) => {
              console.error(`Error processing Deal ${index + 1}:`, error);
              this.toastService.showError(
                `Error procesando la oferta ${index + 1}: ${error.message}`,
                'Cerrar',
              );
              return of(null); // Continue with other deals
            }),
          ),
        );
      }
    });

    console.log('Deal Observables:', dealObservables);
    console.log('Delete Observables:', deleteObservables);

    // Combine deal operations
    forkJoin([...dealObservables, ...deleteObservables]).subscribe(
      (results) => {
        // Extract deal IDs from results and ensure they are strings
        const dealIds = results
          .slice(0, dealObservables.length)
          .filter((id) => id !== null)
          .map((id) => id.toString()); // Ensure all IDs are strings

        // **Log Final Deal IDs**
        console.log('Deal IDs after operations:', dealIds);

        // **Merge dealIds into eventData**
        const submissionData = {
          ...eventData,
          dealIds, // Include dealIds as part of eventData
        };

        console.log('Submission Data with dealIds:', submissionData);

        // Submit the combined data
        this.updateEvent(submissionData);
      },
      (error) => {
        console.error('Error handling deals:', error);
        this.isSubmitting = false;
        this.toastService.showError('Error updating deals', 'Close');
      },
    );
  }

  /**
   * Updates the event and deals.
   * @param eventData The event data to submit.
   * @returns void
   */
  updateEvent(submissionData: any): void {
    this.eventService.update(this.eventId, submissionData).subscribe(
      () => {
        this.isSubmitting = false;
        this.toastService.showSuccess('Event updated successfully', 'Close');
        this.router.navigate(['/website/events']);
      },
      (error) => {
        console.error('Error updating event:', error);
        this.isSubmitting = false;
        this.toastService.showError('Error updating the event', 'Close');
      },
    );
  }
  /**
   * Creates the event and associates the deals.
   * @param eventData The event data to submit.
   */
  createEvent(eventData: any): void {
    console.log('Creating event with data:', eventData);
    // Console log the eventData
    console.log('Submitting event data:', eventData);

    // Remove eventId if present
    const { deals, eventId, ...eventDataWithoutEventId } = eventData;

    this.eventService.create(eventDataWithoutEventId).subscribe(
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
