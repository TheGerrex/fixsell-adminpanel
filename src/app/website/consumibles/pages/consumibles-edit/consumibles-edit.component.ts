import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-consumibles-edit',
  templateUrl: './consumibles-edit.component.html',
  styleUrls: ['./consumibles-edit.component.scss'],
})
export class ConsumiblesEditComponent implements OnInit {
  public editConsumibleForm!: FormGroup;
  public imageUrlsArray: string[] = [];
  Consumible: Consumible | null = null;

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
        this.imageUrlsArray = [...this.Consumible.img_url]; // Update the imageUrlsArray
        this.initalizeForm(); // Moved inside the subscribe block
        console.log(this.Consumible);
        this.sharedService.changeConsumiblesModel(this.Consumible.name);
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
          ? this.Consumible.img_url.map((image) => this.fb.control(image))
          : [],
        Validators.required
      ),
      category: [
        this.Consumible ? this.Consumible.category : '',
        Validators.required,
      ],
      stock: [
        this.Consumible ? this.Consumible.stock : '',
        [Validators.required, Validators.min(0)],
      ],
      location: [
        this.Consumible ? this.Consumible.location : '',
        Validators.required,
      ],
    });
  }

  get images(): FormArray {
    return this.editConsumibleForm.get('images') as FormArray;
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
    const imageUrl = event; // The event should be the URL of the uploaded file
    this.imageUrlsArray.push(imageUrl);
    // Check if the last image URL in the form array is not empty
    if (this.images.at(this.images.length - 1).value !== '') {
      // If it's not empty, add a new control to the form array
      this.addImage();
    }

    // Set the value of the last control in the form array to the image URL
    this.images.at(this.images.length - 1).setValue(imageUrl);
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
  submitForm() {
    // validate form
    if (this.editConsumibleForm.invalid) {
      Object.keys(this.editConsumibleForm.controls).forEach((key) => {
        console.log(
          'Key = ' +
            key +
            ' value = ' +
            this.editConsumibleForm.controls[key].value
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
    formData.weight = parseFloat(formData.weight);
    formData.stock = parseInt(formData.stock);
    formData.price = parseFloat(formData.price);
    console.log(formData);
    const consumiblesId = this.route.snapshot.paramMap.get('id');
    if (consumiblesId === null) {
      console.error('Printer id is null');
      return;
    }

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
