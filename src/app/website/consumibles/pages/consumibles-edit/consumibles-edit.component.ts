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
          ? this.Consumible.images.map((image) => this.fb.control(image))
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

  onFileUploaded(event: any): void {}
  onRemove(index: number): void {}
  submitForm() {}
}
