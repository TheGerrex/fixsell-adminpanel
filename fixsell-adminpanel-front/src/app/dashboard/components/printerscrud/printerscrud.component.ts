import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
//mat button
import { MatButtonModule } from '@angular/material/button';
import swal from 'sweetalert2';
import { Router } from '@angular/router';

export interface Printer {
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
  maxPrintSize : string;
  maxPaperWeight: string;
  paperSizes: string;
  price: Number; 
  applicableOS: string;
  description: string;
  img_url: string;

}

@Component({
  selector: 'app-printerscrud',
  templateUrl: './printerscrud.component.html',
  styleUrls: ['./printerscrud.component.scss']
})
export class PrinterscrudComponent implements OnInit {
  displayedColumns: string[] = ['brand', 'model', 'category', 'price', 'edit', 'delete'];
  dataSource = new MatTableDataSource<Printer>();
  filterValue = '';
  
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.http.get<Printer[]>('http://localhost:3000/printers').subscribe(data => {
      console.log(data);
      
      // const printers = data.map(({ _id,   }) => ({ _id, brand, model, category, price }));
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
    });
  }

  editPrinter(printer: Printer) {
    // Implement edit functionality here
    this.router.navigate(['/dashboard/edit-printer'], { state: { printer } });
  }

  deletePrinter(printer: Printer) {
    swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this printer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const url = `http://localhost:3000/printers/${printer._id}`;
        this.http.delete(url).subscribe(() => {
          console.log(`Printer ${printer._id} deleted successfully`);
          // Remove the deleted printer from the data source
          const index = this.dataSource.data.indexOf(printer);
          if (index >= 0) {
            this.dataSource.data.splice(index, 1);
            this.dataSource._updateChangeSubscription();
          }
        }, error => {
          console.error(`Error deleting printer ${printer._id}: ${error.message}`);
        });
        swal.fire(
          'Deleted!',
          'The printer has been deleted.',
          'success'
        );
      }
    });
  }

  addPrinter() {
    this.router.navigate(['/dashboard/printers-register']);
  }


}