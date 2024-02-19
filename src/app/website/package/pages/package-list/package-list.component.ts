import { HttpClient } from '@angular/common/http';
import { Component, Injectable, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Deal, Printer } from 'src/app/website/interfaces/printer.interface';
import { environment } from 'src/environments/environment';
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
    private PackageService: PackageService,
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
            printer.packages && printer.packages.packagePrice !== null
        );
        console.log('filteredData', filteredData);
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
    if (printer.packages) {
      this.router.navigate([`/website/packages/${printer.packages.id}/edit`], {
        state: { package: printer.packages },
      });
    } else {
      // Handle the case where the printer does not have a deal
      console.error('This printer does not have a package to edit.');
    }
  }

  deletePackage(printer: Printer) {
    this.dialogService
      .openConfirmDialog('Are you sure?', 'Yes', 'delete-dialog') // Add 'delete-dialog' class
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.PackageService.deletePackageById(printer.packages.id).subscribe(
            (response) => {
              console.log(response); // This should log "packages with ID 10 has been removed"
              // Show a toast message after the user confirms the deletion
              this.toastService.showSuccess(
                'Printer deleted successfully',
                'OK'
              );

              // Remove the deleted packages from the dataSource
              const data = this.dataSource.data;
              this.dataSource.data = data.filter(
                (p) => p.packages.id !== printer.packages.id
              );
            },
            (error) => {
              console.error('Error:', error);
              this.dialogService.openErrorDialog(
                'Error deleting package',
                'OK',
                'delete-dialog'
              ); // Show error dialog with 'delete-dialog' class
            }
          );
        }
      });
  }

  addPaquete() {
    this.router.navigate(['/website/packages/create']);
  }
}
