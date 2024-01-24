import { HttpClient } from '@angular/common/http';
import { Component, Injectable, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Deal, Printer } from 'src/app/website/interfaces/printer.interface';
import { environment } from 'src/environments/environments';
import swal from 'sweetalert2';
import { DealService } from '../../services/deal.service';

@Component({
  selector: 'app-deal-list',
  templateUrl: './deal-list.component.html',
  styleUrls: ['./deal-list.component.scss'],
})
export class DealListComponent {
  displayedColumns: string[] = [
    'brand',
    'model',
    'dealDiscountPercentage',
    // 'color',
    'dealPrice',
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
    private authService: AuthService,
    private DealService: DealService
  ) {}

  ngOnInit() {
    this.http
      .get<Printer[]>(`${environment.baseUrl}/printers`)
      .subscribe((data) => {
        console.log(data);

        // Filter out printers with null dealDiscountPercentage
        const filteredData = data.filter(
          (printer) =>
            printer.deal && printer.deal.dealDiscountPercentage !== null
        );
        // const printers = data.map(({ _id,   }) => ({ _id, brand, model, category, price }));
        this.dataSource = new MatTableDataSource(filteredData);
        this.dataSource.paginator = this.paginator;
      });

    const userRoles = this.authService.getCurrentUserRoles();
    this.isAdmin = userRoles.includes('admin');
    if (!this.isAdmin) {
      this.displayedColumns = [
        'brand',
        'model',
        'dealPrice',
        'price',
        'dealDiscountPercentage',
      ];
    }
  }

  seePrinter(printer: Printer) {
    // Implement edit functionality here
    this.router.navigate([`/website/printers/${printer.id}`], {
      state: { printer },
    });
  }
  editPrinter(printer: Printer) {
    // Check if the printer has a deal
    if (printer.deal) {
      this.router.navigate([`/website/deals/${printer.deal.id}/edit`], {
        state: { deal: printer.deal },
      });
    } else {
      // Handle the case where the printer does not have a deal
      console.error('This printer does not have a deal to edit.');
    }
  }

  addPrinter() {
    this.router.navigate(['/website/deals/create']);
  }

  deleteDeal(printer: Printer) {
    swal
      .fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.DealService.deleteDealById(printer.deal.id).subscribe(
            (response) => {
              console.log(response); // This should log "Deal with ID 10 has been removed"
              swal.fire('Deleted!', 'Your deal has been deleted.', 'success');

              // Remove the deleted deal from the dataSource
              const data = this.dataSource.data;
              this.dataSource.data = data.filter(
                (p) => p.deal.id !== printer.deal.id
              );
            }
          );
        }
      });
  }
}
