import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Printer } from 'src/app/website/interfaces/printer.interface';
import { environment } from 'src/environments/environments';
import swal from 'sweetalert2';

@Component({
  selector: 'app-printer-list',
  templateUrl: './printer-list.component.html',
  styleUrls: ['./printer-list.component.scss'],
})
export class PrinterListComponent {
  displayedColumns: string[] = [
    'brand',
    'model',
    'rentable',
    'color',
    'category',
    'price',
    'action',
  ];
  dataSource = new MatTableDataSource<Printer>();
  filterValue = '';
  isAdmin = false;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.http
      .get<Printer[]>(`${environment.baseUrl}/printers`)
      .subscribe((data) => {
        console.log(data);

        // const printers = data.map(({ _id,   }) => ({ _id, brand, model, category, price }));
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
      });

    const userRoles = this.authService.getCurrentUserRoles();
    this.isAdmin = userRoles.includes('admin');
    if (!this.isAdmin) {
      this.displayedColumns = ['brand', 'model', 'category', 'price'];
    }
  }

  seePrinter(printer: Printer) {
    // Implement edit functionality here
    this.router.navigate([`/website/printers/${printer.id}`], {
      state: { printer },
    });
  }
  editPrinter(printer: Printer) {
    // Implement edit functionality here
    this.router.navigate([`/website/printers/${printer.id}/edit`], {
      state: { printer },
    });
  }

  deletePrinter(printer: Printer) {
    swal
      .fire({
        title: 'Are you sure?',
        text: 'Once deleted, you will not be able to recover this printer!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      })
      .then((result) => {
        if (result.isConfirmed) {
          const url = `${environment.baseUrl}/printers/${printer.id}`;
          this.http.delete(url).subscribe(
            () => {
              console.log(`Printer ${printer.id} deleted successfully`);
              // Remove the deleted printer from the data source
              const index = this.dataSource.data.indexOf(printer);
              if (index >= 0) {
                this.dataSource.data.splice(index, 1);
                this.dataSource._updateChangeSubscription();
              }
            },
            (error) => {
              console.error(
                `Error deleting printer ${printer.id}: ${error.message}`
              );
            }
          );
          swal.fire('Deleted!', 'The printer has been deleted.', 'success');
        }
      });
  }

  addPrinter() {
    this.router.navigate(['/website/printers/create']);
  }
}
