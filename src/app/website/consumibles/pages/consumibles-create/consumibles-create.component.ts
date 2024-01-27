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
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.initalizeForm();
  }

  initalizeForm() {
    this.createConsumibleForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      weight: ['', Validators.required],
      shortDescription: ['', Validators.required],
      thumbnailImage: ['', Validators.required],
      longDescription: ['', Validators.required],
      images: this.fb.array([''], Validators.required),
      category: ['', Validators.required],
      stock: ['', Validators.required],
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

  submitForm() {}
}
