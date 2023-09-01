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
  datasheetUrl: string = '';
  maxPrintSizeSimple: string = '';
  impresion: boolean = true;
  copiado: boolean = true;
  escaneo: boolean = true;
  otro: boolean = false;
  otroDetalle: string = '';
  printerFunction: string = '';

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
    this.datasheetUrl = this.printer.datasheetUrl;
    this.maxPrintSizeSimple = this.printer.maxPrintSize;
    this.printerFunction = this.printer.printerFunction;
    //if the printer function contains impresion, copiado or escaneo, set the value to true
    if (this.printer.printerFunction.includes('Impresion')) {
      this.impresion = true;
    } else {
      this.impresion = false;
    }
    if (this.printer.printerFunction.includes('Copiado')) {
      this.copiado = true;
    } else {
      this.copiado = false;
    }

    if (this.printer.printerFunction.includes('Escaneo')) {
      this.escaneo = true;
    } else {
      this.escaneo = false;
    }
    // if printerFunction contains another word that is not impresion, copiado or escaneo, set the value to true
    if (
      this.printer.printerFunction?.match(/(\b\w+\b)/g)?.length! > 3 &&
      !this.printer.printerFunction.includes('Impresion') &&
      !this.printer.printerFunction.includes('Copiado') &&
      !this.printer.printerFunction.includes('Escaneo')
    ) {
      this.otro = true;
    } else {
      this.otro = false;
    }

    //if the printer function contains otro, set the value to true and set the otroDetalle value
    if (this.otro) {
      this.otroDetalle = this.printer.printerFunction.replace(
        'otro',
        ''
      ) as string;
    }
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
    this.printer.datasheetUrl = this.datasheetUrl;
    this.printer.maxPrintSizeSimple = this.maxPrintSize;
    this.printer.printerFunction = this.printerFunction;
    //if the printer function contains impresion, copiado or escaneo, set the value to true
    if (this.impresion) {
      this.printer.printerFunction += 'impresion, ';
    }
    if (this.copiado) {
      this.printer.printerFunction += 'copiado, ';
    }
    if (this.escaneo) {
      this.printer.printerFunction += 'escaneo, ';
    }
    if (this.otro) {
      this.printer.printerFunction += 'otro, ';
    }
    // Remove the last comma and space if printerFunction is not empty
    if (this.printer.printerFunction !== '') {
      this.printer.printerFunction = this.printer.printerFunction.slice(0, -2);
    }

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
      datasheetUrl: this.printer.datasheetUrl,
      maxPrintSizeSimple: this.printer.maxPrintSize,
      printerFunction: this.printer.printerFunction,
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
