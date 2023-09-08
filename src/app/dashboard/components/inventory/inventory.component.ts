import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

export interface Inventory {
  _id: string;
  brand: string;
  model: string;
  category: string;
  color: boolean;
  rentable: boolean;
  duplexUnit: boolean;
  powerConsumption: string;
  dimensions: string;
  printVelocity: Number;
  maxPrintSize: string;
  maxPaperWeight: string;
  paperSizes: string;
  price: Number;
  applicableOS: string;
  description: string;
  img_url: string;
  datasheetUrl: string;
  maxPrintSizeSimple: string;
  printerFunction: string;
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
})
export class InventoryComponent {
  //declaretion of variables
  hideCardBody = false;

  displayedColumns: string[] = [
    'brand',
    'model',
    'category',
    'price',
    'edit',
    'delete',
  ];
  dataSource = new MatTableDataSource<Inventory>();

  //toggle card body
  toggleCardBody() {
    this.hideCardBody = !this.hideCardBody;
  }
}
