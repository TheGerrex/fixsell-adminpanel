import { Component, OnInit } from '@angular/core';
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
import { ConsumiblesService } from '../../services/consumibles.service';
import { Consumible } from 'src/app/website/interfaces/consumibles.interface';
import { FileUploadComponent } from 'src/app/shared/components/file-upload/file-upload.component';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, map, startWith, switchMap } from 'rxjs';
import { Printer } from 'src/app/website/interfaces/printer.interface';

@Component({
  selector: 'app-consumibles-edit',
  templateUrl: './consumibles-edit.component.html',
  styleUrls: ['./consumibles-edit.component.scss'],
})
export class ConsumiblesEditComponent implements OnInit {
  public editConsumibleForm!: FormGroup;
  public imageUrlsArray: string[] = [];
  printerNameControl = new FormControl();
  counterpartNameControl = new FormControl();
  filteredPrinterNames: Observable<string[]> | undefined;
  filteredCounterpartNames: Observable<string[]> | undefined;
  Consumible: Consumible | undefined = undefined;
  isLoadingData = false;
  isSubmitting = false;
  public consumibles: Consumible[] = [];

  constructor(
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private ConsumiblesService: ConsumiblesService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private sharedService: SharedService,
    private validatorsService: ValidatorsService,
  ) {}

  ngOnInit(): void {
    // get printer id from consumibles.printers.id

    this.getConsumible();
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
            map((consumibleNames) =>
              this._counterfilter(value, consumibleNames),
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

  private _counterfilter(value: string, consumibleNames: string[]): string[] {
    const filterValue = value.toLowerCase();
    return consumibleNames.filter((consumibleName) =>
      consumibleName.toLowerCase().includes(filterValue),
    );
  }

  getConsumible() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log(id);
    if (id) {
      console.log('getting consumible' + id);
      this.isLoadingData = true;
      this.ConsumiblesService.getConsumible(id)
        .pipe(
          map((Consumible) => {
            if (Consumible.printers) {
              Consumible.printers = Consumible.printers.map(
                (printer) => printer.model,
              ) as unknown as Printer[];
            }
            if (Consumible.counterparts) {
              Consumible.counterparts = Consumible.counterparts.map(
                (counterpart) => counterpart.name,
              ) as unknown as Consumible[];
            }
            return Consumible;
          }),
        )
        .subscribe((Consumible) => {
          console.log('got consumible from service' + { Consumible });
          console.log({ Consumible });
          this.Consumible = Consumible;
          this.imageUrlsArray = [...this.Consumible.img_url]; // Update the imageUrlsArray
          this.initalizeForm(); // Moved inside the subscribe block
          console.log(this.Consumible);
          this.sharedService.changeConsumiblesModel(this.Consumible.name);
          this.isLoadingData = false;
        });
    }
  }
  initalizeForm() {
    console.log('initializing form');
    this.editConsumibleForm = this.fb.group({
      name: [this.Consumible ? this.Consumible.name : '', Validators.required],
      price: [
        this.Consumible ? this.Consumible.price : '',
        [Validators.required, Validators.min(0.01)],
      ],
      currency: [
        this.Consumible ? this.Consumible.currency : '',
        Validators.required,
      ],
      brand: [
        this.Consumible ? this.Consumible.brand : '',
        Validators.required,
      ],
      sku: [this.Consumible ? this.Consumible.sku : ''],
      shortDescription: [
        this.Consumible ? this.Consumible.shortDescription : '',
      ],
      longDescription: [this.Consumible ? this.Consumible.longDescription : ''],
      img_url: this.fb.array(
        this.Consumible
          ? this.Consumible.img_url
              .filter((image) => typeof image === 'string')
              .map((image) => this.fb.control(image))
          : [],
      ),
      origen: [
        this.Consumible ? this.Consumible.origen : '',
        Validators.required,
      ],
      volume: [this.Consumible ? Number(this.Consumible.volume) : 0],
      compatibleModels: this.fb.array(
        this.Consumible
          ? this.Consumible.compatibleModels?.map((model) =>
              this.fb.control(model),
            ) ?? []
          : [],
      ),

      category: [
        this.Consumible ? this.Consumible.category : '',
        Validators.required,
      ],
      color: [
        this.Consumible ? this.Consumible.color : '',
        Validators.required,
      ],
      yield: [this.Consumible ? this.Consumible.yield : ''],
      printers: this.fb.array(
        this.Consumible ? this.Consumible.printers || [] : [],
      ),
      counterparts: this.fb.array(
        this.Consumible ? this.Consumible.counterparts || [] : [],
      ),
    });
    console.log('this.Consumible:', this.Consumible);
    console.log('this.Consumible.counterpart:', this.Consumible?.counterparts);
    console.log('printers', this.editConsumibleForm.get('printers')?.value);
    console.log(
      'counterparts',
      this.editConsumibleForm.get('counterparts')?.value,
    );
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

  get images(): FormArray {
    return this.editConsumibleForm.get('img_url') as FormArray;
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.editConsumibleForm, field);
  }

  getFieldError(field: string): string | null {
    return this.validatorsService.getFieldError(this.editConsumibleForm, field);
  }

  onFileUploaded(event: any): void {
    const files = Array.isArray(event) ? event : [event]; // The event should be an array of uploaded files

    for (const file of files) {
      if (file) {
        const fileExtension = file.split('.').pop().toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          // It's an image, so add it to the images field
          this.imageUrlsArray.push(file);

          // Get a reference to the img_url form array
          const imgUrlArray = this.editConsumibleForm.get(
            'img_url',
          ) as FormArray;

          // Create a new control with the URL and push it to the form array
          imgUrlArray.push(this.fb.control(file));
        }
      }
    }

    // Handle images
    const imagesControl = this.editConsumibleForm.get('images');
    if (imagesControl) {
      for (const imageUrl of this.imageUrlsArray) {
        // Check if the images FormArray is empty or the last image URL in the form array is not empty
        if (
          this.images.length === 0 ||
          this.images.at(this.images.length - 1).value !== ''
        ) {
          // If it's empty or the last control is not empty, add a new control to the form array
          this.addImage();
        }

        // Set the value of the last control in the form array to the image URL
        this.images.at(this.images.length - 1).setValue(imageUrl);
      }
    }
  }

  onRemove(index: number): void {
    this.imageUrlsArray.splice(index, 1);
    this.removeImage(index);
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

  get compatibleModelsControls() {
    return (this.editConsumibleForm.get('compatibleModels') as FormArray)
      .controls;
  }

  addModel() {
    (this.editConsumibleForm.get('compatibleModels') as FormArray).push(
      new FormControl(''),
    );
  }

  removeModel(index: number) {
    (this.editConsumibleForm.get('compatibleModels') as FormArray).removeAt(
      index,
    );
  }

  addPrinterFromAutocomplete(event: MatAutocompleteSelectedEvent): void {
    const printerName = event.option.viewValue;
    const printers = this.editConsumibleForm.get('printers') as FormArray;
    const emptyIndex = printers.controls.findIndex(
      (control) => control.value === '',
    );

    if (emptyIndex !== -1) {
      printers.at(emptyIndex).setValue(printerName);
    } else {
      this.addPrinter(printerName);
    }

    this.printerNameControl.setValue(''); // Reset the autocomplete field
  }

  addCounterpartFromAutocomplete(event: MatAutocompleteSelectedEvent): void {
    const counterpartName = event.option.viewValue;
    const counterparts = this.editConsumibleForm.get(
      'counterparts',
    ) as FormArray;
    const emptyIndex = counterparts.controls.findIndex(
      (control) => control.value === '',
    );

    if (emptyIndex !== -1) {
      counterparts.at(emptyIndex).setValue(counterpartName);
    } else {
      this.addCounterpart(counterpartName);
    }

    this.counterpartNameControl.setValue(''); // Reset the autocomplete field
  }

  addPrinter(printerName: string = ''): void {
    (this.editConsumibleForm.get('printers') as FormArray).push(
      this.fb.control(printerName),
    );
  }

  addCounterpart(counterpartName: string = ''): void {
    (this.editConsumibleForm.get('counterparts') as FormArray).push(
      this.fb.control(counterpartName),
    );
  }

  removePrinter(index: number) {
    const printers = this.editConsumibleForm.get('printers') as FormArray;
    printers.removeAt(index);
  }

  removeCounterpart(index: number) {
    const counterparts = this.editConsumibleForm.get(
      'counterparts',
    ) as FormArray;
    counterparts.removeAt(index);
  }

  get printers() {
    return (this.editConsumibleForm.get('printers') as FormArray).controls;
  }

  get counterparts() {
    return (this.editConsumibleForm.get('counterparts') as FormArray).controls;
  }

  async submitForm() {
    // validate form
    if (this.editConsumibleForm.invalid) {
      Object.keys(this.editConsumibleForm.controls).forEach((key) => {
        console.log(
          'Key = ' +
            key +
            ' value = ' +
            this.editConsumibleForm.controls[key].value +
            ' valid = ' +
            this.editConsumibleForm.controls[key].valid,
        );
        this.editConsumibleForm.controls[key].markAsTouched();
      });
      console.log('form invalid');
      this.editConsumibleForm.markAllAsTouched();
      this.toastService.showError(
        'Error',
        'Error al actualizar consumible, revise los campos',
      );
      return;
    }

    const formData = this.editConsumibleForm.value;
    formData.price = parseFloat(formData.price);

    console.log(formData);
    const consumiblesId = this.route.snapshot.paramMap.get('id');
    if (consumiblesId === null) {
      console.error('Printer id is null');
      return;
    }

    // Convert printer names to IDs
    const printerNames = formData.printers;
    const printerIdsPromises = printerNames.map((name: string) =>
      this.ConsumiblesService.getPrinterIdByName(name).toPromise(),
    );
    const printersIds = await Promise.all(printerIdsPromises);

    // Convert counterpart names to IDs
    const counterpartNames = formData.counterparts;
    const counterpartIdsPromises = counterpartNames.map((name: string) =>
      this.ConsumiblesService.getCounterpartIdByName(name).toPromise(),
    );
    const counterpartIds = await Promise.all(counterpartIdsPromises);

    // Replace counterpart names with IDs in the form data
    delete formData.counterparts; // delete the old property
    formData.counterpartIds = counterpartIds; // add the new property

    // Replace printer names with IDs in the form data
    delete formData.printers; // delete the old property
    formData.printerIds = printersIds; // add the new property

    // Log the final form data to check if printers has been replaced with printerIds
    console.log('Final form data:', formData);
    this.isSubmitting = true;
    this.ConsumiblesService.updateConsumible(formData, consumiblesId).subscribe(
      (data) => {
        console.log(data);
        this.isSubmitting = false;
        this.toastService.showSuccess(
          'Consumible actualizado',
          'Consumible actualizado correctamente',
        );
        this.router.navigate(['website/consumibles', consumiblesId]);
      },
      (error) => {
        console.log(error);
        this.isSubmitting = false;
        this.toastService.showError(
          'Error',
          'Error al actualizar consumible' + error.error.message,
        );
      },
    );
  }
}
