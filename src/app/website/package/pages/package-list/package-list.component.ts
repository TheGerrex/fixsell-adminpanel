import { HttpClient } from '@angular/common/http';
import { Component, Injectable, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { PackageService } from '../../services/package.service';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { MatSort } from '@angular/material/sort';
import { Package } from 'src/app/website/interfaces/package.interface';

@Component({
  selector: 'app-package-list',
  templateUrl: './package-list.component.html',
  styleUrls: ['./package-list.component.scss'],
})
export class PackageListComponent {
  displayedColumns: string[] = [
    'brand',
    'model',
    'price',
    'currency',
    'packageDuration',
    'packageDiscountPercentage',
    'action',
  ];
  dataSource = new MatTableDataSource<Package>();
  filterValue = '';
  isAdmin = false;
  packageData: Package[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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
      .get<Package[]>(`${environment.baseUrl}/packages`)
      .subscribe((data) => {
        console.log(data);

        // save to packagedata
        this.packageData = data;
        // Filter out packages with null or undefined fields if necessary
        // const filteredData = data.filter((package) => package.field !== null);
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.sort = this.sort;
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

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  addPackage() {
    this.router.navigate(['/website/packages/create']);
  }

  seePackage(packages: Package) {
    // Implement edit functionality here
    this.router.navigateByUrl(`website/printers/${packages.printer.id}`);
  }

  editPackage(packages: Package) {
    this.router.navigateByUrl(`/website/packages/${packages.id}/edit`);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  deletePackage(packages: Package) {
    this.dialogService
      .openConfirmDialog(
        `Are you sure you want to delete the package for ${packages.printer.brand}, with the cost of ${packages.packagePrice}?`,
        'Yes',
        'delete-dialog.'
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.PackageService.deletePackageById(packages.id).subscribe(() => {
            this.toastService.showSuccess('paquete borrado exitosamente', 'OK');
            this.http
              .get<Package[]>(`${environment.baseUrl}/packages`)
              .subscribe((data) => {
                this.packageData = data;
                this.dataSource = new MatTableDataSource(data);
                this.dataSource.sort = this.sort;
                this.dataSource.paginator = this.paginator;
              });
          });
        }
      });
  }
}
