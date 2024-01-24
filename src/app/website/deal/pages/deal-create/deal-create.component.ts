import { Component, OnInit } from '@angular/core';
import { Printer } from '../../../interfaces/printer.interface';
import { PrinterService } from '../../services/deal.service';
import { FormControl } from '@angular/forms';

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

  constructor(private printerService: PrinterService) {}

  ngOnInit() {
    this.printerService
      .getAllPrinterNames()
      .subscribe((printerNames: string[]) => {
        this.printerNames = printerNames;
      });

    // subscribe to the value changes of the printer dropdown
    this.selectedPrinter.valueChanges.subscribe((name: string | null) => {
      if (name !== null) {
        this.printerService
          .findPrinterPriceByName(name)
          .subscribe((price: number) => {
            this.printerPrice = price; // store the price in a variable
            console.log('printer price: ', this.printerPrice);
          });
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

      this.printerService
        .createDealForPrinterByName(this.selectedPrinter.value, deal)
        .subscribe({
          next: (response) =>
            console.log('Deal created successfully', response),
          error: (error) => console.error('Error creating deal', error),
        });
    } else {
      console.error('Printer name, price or discount percentage is missing');
    }
  }
}
