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
/* 
TODO 1: add user input validation
TODO 2: add error handling
TODO 3: add success message
TODO 4: add loading indicator
TODO 5: add confirmation dialog 
TODO 6: add better front end design
*/

@Component({
  selector: 'app-consumibles-create',
  templateUrl: './consumibles-create.component.html',
  styleUrls: ['./consumibles-create.component.scss'],
})
export class ConsumiblesCreateComponent implements OnInit {
  public createConsumibleForm!: FormGroup;
  public imageUrlsArray: string[] = [];

  constructor(
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private ConsumiblesService: ConsumiblesService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private validatorsService: ValidatorsService
  ) {}

  ngOnInit(): void {
    this.initalizeForm();
  }

  initalizeForm() {
    this.createConsumibleForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      weight: [0, [Validators.required, Validators.min(0.01)]],
      shortDescription: ['', Validators.required],
      thumbnailImage: [''],
      longDescription: ['', Validators.required],
      images: this.fb.array([''], Validators.required),
      category: ['', Validators.required],
      stock: [1, [Validators.required, Validators.min(1)]],
      location: ['', Validators.required],
    });
  }

  get images(): FormArray {
    return this.createConsumibleForm.get('images') as FormArray;
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

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(
      this.createConsumibleForm,
      field
    );
  }

  getFieldError(field: string): string | null {
    if (!this.createConsumibleForm.controls[field]) return null;

    const errors = this.createConsumibleForm.controls[field].errors || {};

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
    if (this.createConsumibleForm.invalid) {
      Object.keys(this.createConsumibleForm.controls).forEach((key) => {
        console.log(
          'Key = ' +
            key +
            ', Value = ' +
            this.createConsumibleForm.controls[key].value +
            ', Valid = ' +
            this.createConsumibleForm.controls[key].valid
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
    formData.weight = parseFloat(formData.weight);
    formData.stock = parseInt(formData.stock);
    this.ConsumiblesService.createConsumible(formData).subscribe(
      (response) => {
        this.toastService.showSuccess('Consumible created successfully', 'OK'); // Show success toast
        this.router.navigate(['/website/consumibles']);
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
