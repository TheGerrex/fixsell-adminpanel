import { HttpClient } from '@angular/common/http';
import { Component, Injectable, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Deal, Printer } from 'src/app/website/interfaces/printer.interface';
import { environment } from 'src/environments/environments';
import { PackageService } from '../../services/package.service';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-package-list',
  templateUrl: './package-list.component.html',
  styleUrls: ['./package-list.component.scss'],
})
export class PackageListComponent {
  displayedColumns: string[] = [
    'brand',
    'model',
    'packageDuration',
    'packageDiscountPercentage',
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
    private dialogService: DialogService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.http
      .get<Printer[]>(`${environment.baseUrl}/printers`)
      .subscribe((data) => {
        console.log(data);

        // Filter out printers with null dealDiscountPercentage
        const filteredData = data.filter(
          (printer) =>
            printer.package &&
            printer.package.packageDiscountPercentage !== null
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
        'packageDuration',
        'packageDiscountPercentage',
        'price',
      ];
    }
  }

  seePrinter(printer: Printer) {
    // Implement edit functionality here
    this.router.navigate([`/website/printers/${printer.id}`], {
      state: { printer },
    });
  }
  editPackage(printer: Printer) {
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

  deletePackage(printer: Printer) {}

  addPaquete() {
    this.router.navigate(['/website/paquete/create']);
  }
}
