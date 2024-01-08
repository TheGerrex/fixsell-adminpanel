import { Component, inject } from '@angular/core';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { environment } from 'src/environments/environments';

@Component({
  selector: 'app-printers-register',
  templateUrl: './printers-register.component.html',
  styleUrls: ['./printers-register.component.scss'],
})
export class PrintersRegisterComponent {
  brand: string = '';
  model: string = '';
  category: string = '';
  color: boolean = true;
  rentable: boolean = true;
  duplexUnit: boolean = true;
  powerConsumption: string = '';
  dimensions: string = '';
  printVelocity: Number = 0;
  maxPrintSize: string = '';
  maxPaperWeight: string = '';
  paperSizes: string = '';
  price: Number = 0.0;
  applicableOS: string = '';
  description: string = '';
  img_url: string = '';
  datasheet_url: string = '';
  maxPrintSizeSimple: string = '';
  impresion: boolean = true;
  copiado: boolean = true;
  escaneo: boolean = true;
  otro: boolean = false;
  otroDetalle: string = '';
  printerFunctions: string = '';

  constructor(private http: HttpClient) {}

  printerregister() {
    if (this.model.length < 4) {
      alert('Model input must be at least 4 characters long');
      return;
    }

    // Check if category input is selected
    if (this.category === '') {
      alert('Please select a category');
      return;
    }
    // Check if power consumption input is not empty
    if (this.powerConsumption === '') {
      alert('Please enter a power consumption value');
      return;
    }
    // check if dimensions is not empty
    if (this.dimensions === '') {
      alert('Please enter a dimensions value');
      return;
    }
    //check if print velocity is not 0
    if (this.printVelocity === 0) {
      alert('Please enter a print velocity value');
      return;
    }
    // check if max print size is not empty
    if (this.maxPrintSize === '') {
      alert('Please enter a max print size value');
      return;
    }
    // check if max paper weight is not empty
    if (this.maxPaperWeight === '') {
      alert('Please enter a max paper weight value');
      return;
    }
    // check if paper sizes is not empty
    if (this.paperSizes === '') {
      alert('Please enter a paper sizes value');
      return;
    }
    // check if price is not 0
    if (this.price === 0) {
      alert('Please enter a price value');
      return;
    }
    // check if applicable os is not empty
    if (this.applicableOS === '') {
      alert('Please enter a applicable os value');
      return;
    }
    // check if description is not empty
    if (this.description === '') {
      alert('Please enter a description value');
      return;
    }
    // check if img url is not empty
    if (this.img_url === '') {
      alert('Please enter a img url value');
      return;
    }
    // check if img url is valid
    if (!/^(ftp|http|https):\/\/[^ "]+$/.test(this.img_url)) {
      alert('Please enter a valid img url');
      return;
    }
    // check if brand is not empty
    if (this.brand === '') {
      alert('Please enter a brand value');
      return;
    }

    // add values to printerfunction
    this.printerFunctions = '';
    if (this.impresion) {
      this.printerFunctions += 'Impresion, ';
    }

    if (this.copiado) {
      this.printerFunctions += 'Copiado, ';
    }

    if (this.escaneo) {
      this.printerFunctions += 'Escaneo, ';
    }

    if (this.otro) {
      this.printerFunctions += this.otroDetalle + ', ';
    }

    // Remove the last comma and space if printerFunction is not empty
    if (this.printerFunctions !== '') {
      this.printerFunctions = this.printerFunctions.slice(0, -2);
    }

    console.log(this.printerFunctions);

    let bodyData = {
      brand: this.brand,
      model: this.model,
      category: this.category,
      color: this.color,
      rentable: this.rentable,
      duplexUnit: this.duplexUnit,
      powerConsumption: this.powerConsumption,
      dimensions: this.dimensions,
      printVelocity: this.printVelocity,
      maxPrintSize: this.maxPrintSize,
      maxPaperWeight: this.maxPaperWeight,
      paperSizes: this.paperSizes,
      price: this.price,
      applicableOS: this.applicableOS,
      description: this.description,
      img_url: [this.img_url],
      datasheet_url: this.datasheet_url,
      maxPrintSizeSimple: this.maxPrintSize,
      printerFunctions: this.printerFunctions,
    };
    console.log(bodyData);
    this.http
      .post(`${environment.baseUrl}/printers`, bodyData, {
        responseType: 'text',
      })
      .subscribe(
        (data: any) => {
          console.log(data);
          alert('Impressora registrada con exito!');

          this.brand = '';
          this.model = '';
          this.category = '';
          this.color = true;
          this.rentable = false;
          this.duplexUnit = false;
          this.powerConsumption = '';
          this.dimensions = '';
          this.printVelocity = 0;
          this.maxPrintSize = '';
          this.maxPaperWeight = '';
          this.paperSizes = '';
          this.price = 0.0;
          this.applicableOS = '';
          this.description = '';
          this.img_url = '';
          this.datasheet_url = '';
          this.maxPrintSizeSimple = '';
        },
        (error: HttpErrorResponse) => {
          if (error.status === 400) {
            alert('error.error');
          } else if (error.status === 401) {
            alert('Unauthorized');
          } else if (error.status === 403) {
            alert('Forbidden');
          } else if (error.status === 404) {
            alert('Not Found');
          } else if (error.status === 500) {
            alert('Internal Server Error');
          } else {
            alert('Unknown Error');
          }
        }
      );
  }
}
