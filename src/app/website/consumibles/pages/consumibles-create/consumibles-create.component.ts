import { Component, OnInit } from '@angular/core';
import { Printer } from '../../../interfaces/printer.interface';
import { FormControl, Validators } from '@angular/forms';
import { ToastService } from './../../../../shared/services/toast.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ConsumiblesService } from '../../services/consumibles.service';

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
    private route: ActivatedRoute
  ) {}

  ngOnInit() {}

  addConsumible() {}
}
