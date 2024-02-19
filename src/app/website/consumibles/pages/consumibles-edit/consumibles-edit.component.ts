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
import { MatDialog } from '@angular/material/dialog';

import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, map, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-consumibles-edit',
  templateUrl: './consumibles-edit.component.html',
  styleUrls: ['./consumibles-edit.component.scss'],
})
export class ConsumiblesEditComponent implements OnInit {
  public editConsumibleForm!: FormGroup;
  public imageUrlsArray: string[] = [];
  printerNameControl = new FormControl();
  filteredPrinterNames: Observable<string[]> | undefined;
  Consumible: Consumible | undefined = undefined;

  constructor(
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private ConsumiblesService: ConsumiblesService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private sharedService: SharedService,
    private validatorsService: ValidatorsService
  ) {}

  ngOnInit(): void {
    this.getConsumible();
    this.filteredPrinterNames = this.printerNameControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) =>
        this.ConsumiblesService.getAllPrinterNames().pipe(
          map((printerNames) => this._filter(value, printerNames))
        )
      )
    );
  }

  private _filter(value: string, printerNames: string[]): string[] {
    const filterValue = value.toLowerCase();
    return printerNames.filter((printerName) =>
      printerName.toLowerCase().includes(filterValue)
    );
  }
  getConsumible() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log(id);
    if (id) {
      console.log('getting consumible' + id);
      this.ConsumiblesService.getConsumible(id).subscribe((Consumible) => {
        console.log('got consumible from service' + { Consumible });
        console.log({ Consumible });
        this.Consumible = Consumible;
        this.imageUrlsArray = [...this.Consumible.images]; // Update the imageUrlsArray
        this.initalizeForm(); // Moved inside the subscribe block
        console.log(this.Consumible);
        this.sharedService.changeConsumiblesModel(this.Consumible.name);
      });
    }
  }
  initalizeForm() {
    console.log('initializing form');
    this.editConsumibleForm = this.fb.group({
      name: [
        { value: this.Consumible ? this.Consumible.name : '', disabled: true },
      ],
      price: [
        this.Consumible ? this.Consumible.price : '',
        [Validators.required, Validators.min(0.01)],
      ],
      weight: [
        this.Consumible ? this.Consumible.weight : '',
        [Validators.required, Validators.min(0.01)],
      ],
      shortDescription: [
        this.Consumible ? this.Consumible.shortDescription : '',
        Validators.required,
      ],
      longDescription: [
        this.Consumible ? this.Consumible.longDescription : '',
        Validators.required,
      ],
      images: this.fb.array(
        this.Consumible
          ? this.Consumible.img_url
              .filter((image) => typeof image === 'string')
              .map((image) => this.fb.control(image))
          : []
      ),
      origen: [
        this.Consumible ? this.Consumible.origen : '',
        Validators.required,
      ],
      volume: [
        this.Consumible ? Number(this.Consumible.volume) : 0,
        Validators.required,
      ],
      compatibleModels: this.fb.array(
        this.Consumible
          ? this.Consumible.compatibleModels?.map((model) =>
              this.fb.control(model)
            ) ?? []
          : []
      ),

      category: [
        this.Consumible ? this.Consumible.category : '',
        Validators.required,
      ],
      stock: [
        this.Consumible ? this.Consumible.stock : '',
        [Validators.required, Validators.min(0)],
      ],
      printers: this.fb.array(
        this.Consumible ? this.Consumible.printers || [] : []
      ),
      counterpart: [this.Consumible ? this.Consumible.counterpart : ''],
    });
  }

  get images(): FormArray {
    return this.editConsumibleForm.get('img_url') as FormArray;
  }

  isValidField(field: string): boolean | null {
    // console.log(this.validatorsService.isValidField(this.editPrinterForm, field))
    return this.validatorsService.isValidField(this.editConsumibleForm, field);
  }

  getFieldError(field: string): string | null {
    if (!this.editConsumibleForm.controls[field]) return null;

    const errors = this.editConsumibleForm.controls[field].errors || {};

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

  //Function for when user uploads file
  //Fills up images array with the file url of the uploaded image
  onFileUploaded(event: any): void {
    let imageUrl = event;
    // If event is an array, extract the first element as the URL
    if (Array.isArray(event)) {
      imageUrl = event[0];
    }
    this.imageUrlsArray.push(imageUrl);

    // Check if the images FormArray is not empty
    if (this.images.length > 0) {
      // Check if the last image URL in the form array is not empty
      if (this.images.at(this.images.length - 1).value !== '') {
        // If it's not empty, add a new control to the form array
        this.addImage();
      }

      // Set the value of the last control in the form array to the image URL
      this.images.at(this.images.length - 1).setValue(imageUrl);
    } else {
      // If the images FormArray is empty, add a new control to it
      this.addImage();
      // Set the value of the new control to the image URL
      this.images.at(0).setValue(imageUrl);
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
      new FormControl('')
    );
  }

  removeModel(index: number) {
    (this.editConsumibleForm.get('compatibleModels') as FormArray).removeAt(
      index
    );
  }

  addPrinterFromAutocomplete(event: MatAutocompleteSelectedEvent): void {
    const printerName = event.option.viewValue;
    const printers = this.editConsumibleForm.get('printers') as FormArray;
    const emptyIndex = printers.controls.findIndex(
      (control) => control.value === ''
    );

    if (emptyIndex !== -1) {
      printers.at(emptyIndex).setValue(printerName);
    } else {
      this.addPrinter(printerName);
    }

    this.printerNameControl.setValue(''); // Reset the autocomplete field
  }

  addPrinter(printerName: string = ''): void {
    (this.editConsumibleForm.get('printers') as FormArray).push(
      this.fb.control(printerName)
    );
  }

  removePrinter(index: number) {
    const printers = this.editConsumibleForm.get('printers') as FormArray;
    if (index !== 0) {
      printers.removeAt(index);
    } else {
      printers.at(0).setValue('');
    }
  }

  get printers() {
    return (this.editConsumibleForm.get('printers') as FormArray).controls;
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
            this.editConsumibleForm.controls[key].valid
        );
        this.editConsumibleForm.controls[key].markAsTouched();
      });
      console.log('form invalid');
      this.editConsumibleForm.markAllAsTouched();
      this.toastService.showError(
        'Error',
        'Error al actualizar consumible, revise los campos'
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
      this.ConsumiblesService.getPrinterIdByName(name).toPromise()
    );
    const printersIds = await Promise.all(printerIdsPromises);

    // Convert counterpart to counterpartId
    const counterpartName = formData.counterpart;
    if (counterpartName) {
      // Replace counterpart with counterpartId in the form data
      const counterpartId = counterpartName;
      delete formData.counterpart; // delete the old property
      formData.counterpartId = counterpartId; // add the new property
    } else {
      delete formData.counterpart; // delete the old property if counterpartName is empty
    }
    // Replace printer names with IDs in the form data
    delete formData.printers; // delete the old property
    formData.printersIds = printersIds; // add the new property

    this.ConsumiblesService.updateConsumible(formData, consumiblesId).subscribe(
      (data) => {
        console.log(data);
        this.toastService.showSuccess(
          'Consumible actualizado',
          'Consumible actualizado correctamente'
        );
        this.router.navigate(['website/consumibles']);
      },
      (error) => {
        console.log(error);
        this.toastService.showError(
          'Error',
          'Error al actualizar consumible' + error.error.message
        );
      }
    );
  }
}
