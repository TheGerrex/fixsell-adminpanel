import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Printer } from '../printerscrud/printerscrud.component';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
import { environment } from 'src/environments/environments';

@Component({
  selector: 'app-edit-printer',
  templateUrl: './edit-printer.component.html',
  styleUrls: ['./edit-printer.component.scss'],
})
export class EditPrinterComponent {
  printer: Printer;
  _id: string = '';
  brand: string = '';
  model: string = '';
  category: string = '';
  color: boolean = false;
  rentable: boolean = false;
  duplexUnit: boolean = false;
  powerConsumption: string = '';
  dimensions: string = '';
  printVelocity: Number = 0;
  maxPrintSize: string = '';
  maxPaperWeight: string = '';
  paperSizes: string = '';
  price: Number = 0;
  applicableOS: string = '';
  description: string = '';
  img_url: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.printer = history.state.printer;
    console.log('State data:', history.state);
    console.log('Printer data:', this.printer);
  }

  ngOnInit() {
    this.printer = history.state.printer;
    this._id = this.printer._id;
    this.brand = this.printer.brand;
    this.model = this.printer.model;
    this.category = this.printer.category;
    this.color = this.printer.color;
    this.rentable = this.printer.rentable;
    this.duplexUnit = this.printer.duplexUnit;
    this.powerConsumption = this.printer.powerConsumption;
    this.dimensions = this.printer.dimensions;
    this.printVelocity = this.printer.printVelocity;
    this.maxPrintSize = this.printer.maxPrintSize;
    this.maxPaperWeight = this.printer.maxPaperWeight;
    this.paperSizes = this.printer.paperSizes;
    this.price = this.printer.price;
    this.applicableOS = this.printer.applicableOS;
    this.description = this.printer.description;
    this.img_url = this.printer.img_url;
  }

  updatePrinter() {
    // update with new values
    this.printer.brand = this.brand;
    this.printer.model = this.model;
    this.printer.category = this.category;
    this.printer.color = this.color;
    this.printer.rentable = this.rentable;
    this.printer.duplexUnit = this.duplexUnit;
    this.printer.powerConsumption = this.powerConsumption;
    this.printer.dimensions = this.dimensions;
    this.printer.printVelocity = this.printVelocity;
    this.printer.maxPrintSize = this.maxPrintSize;
    this.printer.maxPaperWeight = this.maxPaperWeight;
    this.printer.paperSizes = this.paperSizes;
    this.printer.price = this.price;
    this.printer.applicableOS = this.applicableOS;
    this.printer.description = this.description;
    this.printer.img_url = this.img_url;

    //create a new printer object with the updated values
    const printerData = {
      brand: this.printer.brand,
      model: this.printer.model,
      category: this.printer.category,
      color: this.printer.color,
      rentable: this.printer.rentable,
      duplexUnit: this.printer.duplexUnit,
      powerConsumption: this.printer.powerConsumption,
      dimensions: this.printer.dimensions,
      printVelocity: this.printer.printVelocity,
      maxPrintSize: this.printer.maxPrintSize,
      maxPaperWeight: this.printer.maxPaperWeight,
      paperSizes: this.printer.paperSizes,
      price: this.printer.price,
      applicableOS: this.printer.applicableOS,
      description: this.printer.description,
      //convert to string instead of array
      img_url: this.printer.img_url.toString(),
    };
    console.log(printerData);

    swal
      .fire({
        title: 'Are you sure?',
        text: 'Do you want to update this printer?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'No, cancel',
      })
      .then((result) => {
        if (result.isConfirmed) {
          // Send a PATCH request to update the printer in the database
          this.http
            .patch(
              `${environment.baseUrl}/printers/${this.printer._id}`,
              printerData
            )
            .subscribe(() => {
              // Show a success message
              swal.fire({
                title: 'Success!',
                text: 'Printer updated successfully!',
                icon: 'success',
              });

              // Redirect to the printers list page
              this.router.navigate(['/dashboard/printerscrud']);
            });
        }
      });
  }
}
