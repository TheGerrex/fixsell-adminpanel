import { Component, OnInit } from '@angular/core';
import { Printer } from '../../../interfaces/printer.interface';
import { DealService } from '../../services/deal.service';
import { FormControl } from '@angular/forms';
import { ToastService } from './../../../../shared/services/toast.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

/* 
TODO 1: add user input validation
TODO 2: add error handling
TODO 3: add success message
TODO 4: add loading indicator
TODO 5: add confirmation dialog 
TODO 6: add better front end design
*/

@Component({
  selector: 'app-deal-create',
  templateUrl: './deal-create.component.html',
  styleUrls: ['./deal-create.component.scss'],
})
export class DealCreateComponent implements OnInit {
  printerNames: string[] = [];
  selectedPrinter = new FormControl(''); // form control for the printer dropdown
  printerPrice: number = 0; // initialize the printerPrice property with a default value of 0
  dealDiscountPercentage = new FormControl('');
  dealPrice = new FormControl('');
  dealStartDate = new FormControl('');
  dealEndDate = new FormControl('');
  dealDescription = new FormControl('');

  constructor(
    private DealService: DealService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const printerId = this.route.snapshot.paramMap.get('id');

    this.DealService.getAllPrinterNames().subscribe(
      (printerNames: string[]) => {
        this.printerNames = printerNames;

        if (printerId) {
          // If a printer id is present in the URL, find the printer name with that id
          const printerName = this.printerNames.find(
            (name) => name === printerId
          );

          if (printerName) {
            // If a printer with the specified id is found, select it
            this.selectedPrinter.setValue(printerName);
          }
        }
      }
    );

    // subscribe to the value changes of the printer dropdown
    this.selectedPrinter.valueChanges.subscribe((name: string | null) => {
      if (name !== null) {
        this.DealService.findPrinterPriceByName(name).subscribe(
          (price: number) => {
            this.printerPrice = price; // store the price in a variable
            console.log('printer price: ', this.printerPrice);
          }
        );
      }
    });
  }

  calculatePrice() {
    if (this.dealDiscountPercentage.value) {
      const discount =
        Number(this.printerPrice) *
        (Number(this.dealDiscountPercentage.value) / 100);
      this.dealPrice.setValue((this.printerPrice - discount).toString()); // Convert the calculated price to a string
    }
  }

  calculatePercentage() {
    if (this.dealPrice.value) {
      const discount = this.printerPrice - Number(this.dealPrice.value); // Convert the deal price value to a number
      const percentage = (discount / this.printerPrice) * 100;
      this.dealDiscountPercentage.setValue(percentage.toString()); // Convert the percentage to a string
    }
  }

  addPromotion() {
    if (
      this.selectedPrinter.value &&
      (this.dealPrice.value || this.dealDiscountPercentage.value)
    ) {
      const deal = {
        dealPrice: Number(this.dealPrice.value),
        dealDiscountPercentage: Number(this.dealDiscountPercentage.value),
        dealStartDate: this.dealStartDate.value,
        dealEndDate: this.dealEndDate.value,
        dealDescription: this.dealDescription.value,
      };

      console.log('Deal object: ', deal);

      this.DealService.createDealForPrinterByName(
        this.selectedPrinter.value,
        deal
      ).subscribe({
        next: (response) => {
          console.log('Deal created successfully', response);
          this.toastService.showSuccess('Deal created successfully', 'OK'); // Show success toast
          this.router.navigate(['/website/deals']); // Navigate to the deals page
        },
        error: (error) => {
          console.error('Error creating deal', error);
          this.toastService.showError('Error creating deal', 'OK'); // Show error toast
        },
      });
    } else {
      console.error('Printer name, price or discount percentage is missing');
      this.toastService.showError(
        'Printer name, price or discount percentage is missing',
        'OK'
      ); // Show error toast
    }
  }
}
