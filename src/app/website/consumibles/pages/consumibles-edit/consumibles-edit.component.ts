import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
      currency: [
        this.Consumible ? this.Consumible.currency : '',
        Validators.required,
      ],
      brand: [
        this.Consumible ? this.Consumible.brand : '',
        Validators.required,
      ],
      sku: [this.Consumible ? this.Consumible.sku : '', Validators.required],
      shortDescription: [
        this.Consumible ? this.Consumible.shortDescription : '',
        Validators.required,
      ],
      longDescription: [
        this.Consumible ? this.Consumible.longDescription : '',
        Validators.required,
      ],
      img_url: this.fb.array(
        this.Consumible
          ? this.Consumible.img_url.map((image) => this.fb.control(image))
          : [],
        Validators.required
      ),
      origen: [
        this.Consumible ? this.Consumible.origen : '',
        Validators.required,
      ],
      volume: [
        this.Consumible ? this.Consumible.volume : '',
        Validators.required,
      ],

      category: [
        this.Consumible ? this.Consumible.category : '',
        Validators.required,
      ],
      color: [
        this.Consumible ? this.Consumible.color : '',
        Validators.required,
      ],
      yield: [
        this.Consumible ? this.Consumible.yield : '',
        Validators.required,
      ],
      // printers: [this.Consumible ? this.Consumible.printers : '', Validators.required],
      counterpart: [
        this.Consumible ? this.Consumible.counterpart : '',
        Validators.required,
      ],
    });
  }

  openConfirmDialog(index: number): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Borrar imagen de la impresora',
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

  onFileUploaded(event: any): void {
    const files = Array.isArray(event) ? event : [event]; // The event should be an array of uploaded files
  
    for (const file of files) {
      if (file) {
        const fileExtension = file.split('.').pop().toLowerCase();
  
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          // It's an image, so add it to the images field
          this.imageUrlsArray.push(file);
  
          // Get a reference to the img_url form array
          const imgUrlArray = this.editConsumibleForm.get('img_url') as FormArray;
  
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
