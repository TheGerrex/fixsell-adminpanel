import { Component, OnInit } from '@angular/core';
import { Printer } from '../../../interfaces/printer.interface';
import { FormControl, Validators } from '@angular/forms';
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
  images = new FormControl('', Validators.required);
  category = new FormControl('', Validators.required);
  stock = new FormControl('', Validators.required);
  location = new FormControl('', Validators.required);

  constructor(
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private ConsumiblesService: ConsumiblesService
  ) {}

  ngOnInit() {}

  addConsumible() {
    const consumible: Consumible = {
      name: this.name.value!,
      price: Number(this.price.value),
      weight: Number(this.weight.value),
      shortDescription: this.shortDescription.value || '',
      thumbnailImage: this.thumbnailImage.value || '',
      longDescription: this.longDescription.value || '',
      images: Array.isArray(this.images.value)
        ? this.images.value.filter((image) => image !== null)
        : [],
      category: this.category.value || '',
      stock: Number(this.stock.value),
      location: this.location.value || '',
    };

    console.log('consumible object', consumible);

    this.ConsumiblesService.createConsumible(consumible).subscribe(
      (response: Consumible) => {
        this.toastService.showSuccess('consumible created successfully', 'OK');
        this.router.navigate(['/consumibles']);
      },
      (error) => {
        this.toastService.showError('Error creating consumible', 'OK');
      }
    );
  }
}
