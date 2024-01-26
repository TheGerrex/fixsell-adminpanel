import { Component, OnInit } from '@angular/core';
import { Printer } from '../../../interfaces/printer.interface';
import {
  FormControl,
  Validators,
  FormBuilder,
  FormArray,
} from '@angular/forms';
import { ToastService } from './../../../../shared/services/toast.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ConsumiblesService } from '../../services/consumibles.service';
import { Consumible } from 'src/app/website/interfaces/consumibles.interface';
import { FileUploadComponent } from 'src/app/shared/components/file-upload/file-upload.component';

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
  name = new FormControl('', Validators.required);
  price = new FormControl('', Validators.required);
  weight = new FormControl('', Validators.required);
  shortDescription = new FormControl('', Validators.required);
  thumbnailImage = new FormControl('', Validators.required);
  longDescription = new FormControl('', Validators.required);
  images = this.fb.array([this.fb.control('')]);
  category = new FormControl('', Validators.required);
  stock = new FormControl('', Validators.required);
  location = new FormControl('', Validators.required);

  constructor(
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private ConsumiblesService: ConsumiblesService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {}

  //Function for when user uploads file
  //Fills up images array with the file url of the uploaded image
  onFileUploaded(link: string) {
    // Get the current value of the images form control
    let images: (string | null)[] = this.images.value;

    // If the current value is not an array, initialize it to an empty array
    if (!Array.isArray(images)) {
      images = [];
    }

    // Append the link to the images array
    images.push(link);

    // Update the value of the images form control
    this.images.setValue(images);
  }

  get imagesControls() {
    return (this.images as FormArray).controls;
  }

  addImage() {
    this.images.push(this.fb.control(''));
  }

  removeImage(index: number) {
    this.images.removeAt(index);
  }

  addConsumible() {
    const consumible: Consumible = {
      name: this.name.value!,
      price: Number(this.price.value),
      weight: Number(this.weight.value),
      shortDescription: this.shortDescription.value || '',
      thumbnailImage: this.thumbnailImage.value || '',
      longDescription: this.longDescription.value || '',
      images: Array.isArray(this.images.value)
        ? (this.images.value.filter((image) => image !== null) as string[])
        : [],
      category: this.category.value || '',
      stock: Number(this.stock.value),
      location: this.location.value || '',
    };

    console.log('consumible object', consumible);

    this.ConsumiblesService.createConsumible(consumible).subscribe(
      (response: Consumible) => {
        console.log('Success:', response);
        this.router.navigate(['website/consumibles']);
        this.toastService.showSuccess('consumible created successfully', 'OK');
      },
      (error) => {
        console.log('Error:', error);
        this.toastService.showError('Error creating consumible', 'OK');
      }
    );
  }
}
