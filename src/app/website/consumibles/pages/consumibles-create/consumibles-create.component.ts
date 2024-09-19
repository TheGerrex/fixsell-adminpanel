import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { ToastService } from './../../../../shared/services/toast.service';
import { Router } from '@angular/router';
import { ConsumiblesService } from '../../services/consumibles.service';
import { Consumible } from 'src/app/website/interfaces/consumibles.interface';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { startWith, map, switchMap } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { MatCheckboxChange } from '@angular/material/checkbox';
@Component({
  selector: 'app-consumibles-create',
  templateUrl: './consumibles-create.component.html',
  styleUrls: ['./consumibles-create.component.scss'],
})
export class ConsumiblesCreateComponent implements OnInit {
  public createConsumibleForm!: FormGroup;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  public imageUrlsArray: string[] = [];
  printerNameControl: FormControl = new FormControl();
  counterpartNameControl: FormControl = new FormControl();
  filteredPrinterNames: Observable<string[]> | undefined;
  filteredCounterpartNames: Observable<string[]> | undefined;
  public consumibles: Consumible[] = [];
  Consumible: Consumible | undefined = undefined;
  isSubmitting = false;
  models: string[] = [];

  constructor(
    private toastService: ToastService,
    private router: Router,
    private ConsumiblesService: ConsumiblesService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private validatorsService: ValidatorsService,
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.initalizeForm();
    this.filteredPrinterNames = this.printerNameControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) =>
        this.ConsumiblesService.getAllPrinterNames().pipe(
          map((printerNames) => this._filter(value, printerNames)),
        ),
      ),
    );
    this.filteredCounterpartNames =
      this.counterpartNameControl.valueChanges.pipe(
        startWith(''),
        switchMap((value) =>
          this.ConsumiblesService.getAllConsumibleNames().pipe(
            map((counterpartNames) =>
              this._counterfilter(value, counterpartNames),
            ),
          ),
        ),
      );
    this.ConsumiblesService.getAllConsumibles().subscribe(
      (consumibles: Consumible[]) => {
        this.consumibles = consumibles;
      },
    );
  }

  private _filter(value: string, printerNames: string[]): string[] {
    const filterValue = value.toLowerCase();
    return printerNames.filter((printerName) =>
      printerName.toLowerCase().includes(filterValue),
    );
  }

  private _counterfilter(value: string, counterpartNames: string[]): string[] {
    const filterValue = value.toLowerCase();
    return counterpartNames.filter((counterpartName) =>
      counterpartName.toLowerCase().includes(filterValue),
    );
  }

  get printers() {
    return (this.createConsumibleForm.get('printers') as FormArray).controls as FormControl[];
  }

  get counterparts() {
    return (this.createConsumibleForm.get('counterparts') as FormArray)
      .controls as FormControl[];
  }

  get compatibleModelsControls() {
    return (this.createConsumibleForm.get('compatibleModels') as FormArray)
      .controls as FormControl[];
  }

  get images(): FormArray {
    return this.createConsumibleForm.get('images') as FormArray;
  }

  initalizeForm() {
    this.createConsumibleForm = this.fb.group({
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
      currency: ['MXN', Validators.required],
      brand: ['', [Validators.required]],
      sku: [''],
      shortDescription: [''],
      longDescription: [''],
      img_url: this.fb.array([]),
      origen: ['', Validators.required],
      volume: [null],
      category: ['', Validators.required],
      compatibleModels: this.fb.array([]),
      color: ['', Validators.required],
      yield: [null],
      printers: this.fb.array([]),
      counterparts: this.fb.array([]),
    });
  }

  openConfirmDialog(index: number): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Eliminar imagen de la impresora',
      message: 'Estas seguro de querer eliminar esta imagen?',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.onRemove(index);
        this.toastService.showSuccess('Imagen eliminada con exito', 'Aceptar');
      }
    });
  }

  addPrinter(printerName: string = ''): void {
    console.log('printerName:', printerName);
    (this.createConsumibleForm.get('printers') as FormArray).push(
      this.fb.control(printerName),
    );
  }

  removePrinter(printerName: string) {
    const printers = this.createConsumibleForm.get('printers') as FormArray;
    const index = printers.controls.findIndex(control => control.value === printerName);

    if (index !== -1) {
      printers.removeAt(index);
    }
  }

  isPrinterAdded(printerName: string) {
    // Implement your logic here to check whether the printer is already added.
    return this.printers.map(control => control.value).includes(printerName);
  }

  addPrinterFromAutocomplete(event: MatAutocompleteSelectedEvent): void {
    const printerName = event.option.viewValue;
    const printers = this.createConsumibleForm.get('printers') as FormArray;

    // Check if the printer is already added.
    if (printers.controls.some(control => control.value === printerName)) {
      this.printerNameControl.setValue(''); // Reset the autocomplete field
      return; // Return early to prevent adding the printer again.
    }

    const emptyIndex = printers.controls.findIndex(control => control.value === '');

    if (emptyIndex !== -1) {
      printers.at(emptyIndex).setValue(printerName);
    } else {
      this.addPrinter(printerName);
    }

    this.printerNameControl.setValue(''); // Reset the autocomplete field
  }

  togglePrinterSelection(event: MatCheckboxChange, printerName: string) {
    if (event.checked) {
      this.addPrinter(printerName);
    } else {
      this.removePrinter(printerName);
    }

    // Trigger change detection manually.
    this.changeDetector.detectChanges();
  }


  addCounterpart(counterpart: string = ''): void {
    (this.createConsumibleForm.get('counterparts') as FormArray).push(
      this.fb.control(counterpart),
    );
  }

  removeCounterpart(counterpartName: string) {
    const counterparts = this.createConsumibleForm.get('counterparts') as FormArray;
    const index = counterparts.controls.findIndex(control => control.value === counterpartName);

    if (index !== -1) {
      counterparts.removeAt(index);
    }
  }

  isCounterpartAdded(counterpartName: string): boolean {
    // Implement your logic here to check whether the counterpart is already added.
    return this.counterparts.map(control => control.value).includes(counterpartName);
  }

  addCounterpartFromAutocomplete(event: MatAutocompleteSelectedEvent): void {
    const counterpartName = event.option.viewValue;
    const counterparts = this.createConsumibleForm.get('counterparts') as FormArray;

    // Check if the counterpart is already added.
    if (counterparts.controls.some(control => control.value === counterpartName)) {
      this.counterpartNameControl.setValue(''); // Reset the autocomplete field
      return; // Return early to prevent adding the counterpart again.
    }

    const emptyIndex = counterparts.controls.findIndex(control => control.value === '');

    if (emptyIndex !== -1) {
      counterparts.at(emptyIndex).setValue(counterpartName);
    } else {
      this.addCounterpart(counterpartName);
    }

    this.counterpartNameControl.setValue(''); // Reset the autocomplete field
  }

  toggleCounterpartSelection(event: MatCheckboxChange, counterpartName: string) {
    if (event.checked) {
      this.addCounterpart(counterpartName);
    } else {
      console.log('counterpartName:', counterpartName);
      this.removeCounterpart(counterpartName);
    }

    // Trigger change detection manually.
    this.changeDetector.detectChanges();
  }

  addModel(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value.trim();

    // Add the model.
    if (value) {
      this.models.push(value);
      this.syncModels();
    }

    // Reset the input value.
    if (input) {
      input.value = '';
    }
  }

  removeModel(model: string): void {
    const index = this.models.indexOf(model);

    if (index !== -1) {
      this.models.splice(index, 1);
      this.syncModels();
    }
  }

  editModel(index: number, event: MatChipEditedEvent): void {
    const value = event.value.trim();

    // Update the model.
    if (value) {
      this.models[index] = value;
      this.syncModels();
    }
  }

  syncModels(): void {
    const models = this.createConsumibleForm.get('compatibleModels') as FormArray;

    // Clear the FormArray.
    while (models.length !== 0) {
      models.removeAt(0);
    }

    // Populate the FormArray with the models.
    this.models.forEach(model => models.push(this.fb.control(model)));
  }

  addImage(): void {
    this.images.push(this.fb.control(''));
  }

  removeImage(index: number): void {
    this.images.removeAt(index);
  }

  previewImage(index: number): void {
    const imageUrl = this.images.at(index).value;
    this.dialog.open(DialogComponent, {
      data: {
        imageUrl: imageUrl,
      },
    });
  }

  //Function for when user uploads file
  //Fills up images array with the file url of the uploaded image
  onFileUploaded(event: any): void {
    const files = Array.isArray(event) ? event : [event]; // The event should be an array of uploaded files
    console.log('files', files);

    for (const file of files) {
      if (file) {
        const fileExtension = file.split('.').pop().toLowerCase();
        console.log('fileExtension', fileExtension);

        if (fileExtension === 'pdf') {
          // It's a PDF, so add it to the datasheet_url field
          const datasheetControl =
            this.createConsumibleForm.get('datasheet_url');
          console.log('datasheetControl', datasheetControl);
          if (datasheetControl) {
            datasheetControl.setValue(file);
            console.log(
              'I have set the value for datasheet:',
              datasheetControl.value,
            );
          }
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          // It's an image, so add it to the images field
          this.imageUrlsArray.push(file);
          console.log('imageUrlsArray', this.imageUrlsArray);

          // Get a reference to the img_url form array
          const imgUrlArray = this.createConsumibleForm.get(
            'img_url',
          ) as FormArray;

          // Create a new control with the URL and push it to the form array
          imgUrlArray.push(this.fb.control(file));
          console.log(this.createConsumibleForm);
        }
      }
    }
    // Handle images
    const imagesControl = this.createConsumibleForm.get('images');
    if (imagesControl) {
      for (const imageUrl of this.imageUrlsArray) {
        // Check if the last image URL in the form array is not empty
        if (this.images.at(this.images.length - 1).value !== '') {
          // If it's not empty, add a new control to the form array
          this.addImage();
        }

        // Set the value of the last control in the form array to the image URL
        this.images.at(this.images.length - 1).setValue(imageUrl);
      }
    }
  }

  onRemove(index: number): void {
    console.log('remove image at index: ', index);

    const imageUrl = this.imageUrlsArray[index];
    console.log('imageUrl:', imageUrl);
    this.ConsumiblesService.deleteImagePrinter(imageUrl).subscribe(
      (response) => {
        console.log('Image deleted successfully', response);
        this.toastService.showSuccess('Imagen borrada con éxito', 'Cerrar');
        this.imageUrlsArray.splice(index, 1); // Remove the image from the array

        // Update the form control
        const controlArray = <FormArray>(
          this.createConsumibleForm.get('img_url')
        );
        controlArray.clear(); // Clear the existing form array
        this.imageUrlsArray.forEach((url) => {
          controlArray.push(new FormControl(url)); // Add the remaining URLs back to the form array
        });

        // this.removeImage(index);
      },
      (error) => {
        this.toastService.showError(error.error.message, 'Cerrar');
      },
    );
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(
      this.createConsumibleForm,
      field,
    );
  }

  getFieldError(field: string): string | null {
    return this.validatorsService.getFieldError(
      this.createConsumibleForm,
      field,
    );
  }

  async submitForm() {
    if (this.createConsumibleForm.invalid) {
      Object.keys(this.createConsumibleForm.controls).forEach((key) => {
        console.log(
          'Key = ' +
          key +
          ', Value = ' +
          this.createConsumibleForm.controls[key].value +
          ', Valid = ' +
          this.createConsumibleForm.controls[key].valid,
        );
      });
      console.log('invalid form');
      //reason of invalid form
      console.log(this.createConsumibleForm.errors);
      console.log(this.createConsumibleForm);
      console.log(this.createConsumibleForm.value);

      this.createConsumibleForm.markAllAsTouched();
      return;
    }
    const formData = this.createConsumibleForm.value;
    // formData.price = parseFloat(formData.price);

    // Convert printer names to IDs
    const printerNames = formData.printers;
    const printerIdsPromises = printerNames.map((name: string) =>
      this.ConsumiblesService.getPrinterIdByName(name).toPromise(),
    );
    const printersIds = await Promise.all(printerIdsPromises);

    //convert counterpart names to IDs
    const counterpartNames = formData.counterparts;
    const counterpartIdsPromises = counterpartNames.map((name: string) =>
      this.ConsumiblesService.getConsumibleIdByName(name).toPromise(),
    );
    const counterpartIds = await Promise.all(counterpartIdsPromises);

    //replace counterpart names with IDs in the form data
    delete formData.counterparts; //delete the old property
    formData.counterpartIds = counterpartIds; //add the new property

    // Replace printer names with IDs in the form data
    delete formData.printers; // delete the old property
    formData.printersIds = printersIds; // add the new property
    this.isSubmitting = true;

    console.log('formData:', formData);
    this.ConsumiblesService.createConsumible(formData).subscribe(
      (response) => {
        console.log('Response:', response);
        this.isSubmitting = false;
        this.toastService.showSuccess('Consumible creado', 'Cerrar'); // Show success toast
        this.router.navigate(['/website/consumibles', response.id]);
      },
      (error) => {
        console.log(error);
        //log object to console
        console.log(formData);
        this.isSubmitting = false;
        this.toastService.showError(
          'There was an error: ' + error.error.message + '. Please try again.',
          'error-snackbar',
        );
      },
    );
  }
}
