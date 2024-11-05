import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { PackageService } from '../../services/package.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { MatSort } from '@angular/material/sort';
import { Package } from 'src/app/website/interfaces/package.interface';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-package-list',
  templateUrl: './package-list.component.html',
  styleUrls: ['./package-list.component.scss'],
})
export class PackageListComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<Package>();
  searchTerm = '';
  packageData: Package[] = [];
  isLoadingData = false;
  displayedColumns: string[] = [
    'model',
    'prints',
    'deposit',
    'monthlyPrice',
    'packageDuration',
    'packageEndDate',
    'action',
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private packageService: PackageService,
    private dialog: MatDialog,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    Promise.resolve().then(() => this.loadData());
    const userRoles = this.authService.getCurrentUserRoles();
  }

  loadData() {
    this.isLoadingData = true;
    this.packageService.getAllPackages().subscribe(
      (data) => {
        console.log(data);
        this.packageData = data;
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.isLoadingData = false;
      },
      (error) => {
        console.error('Error:', error);
        this.isLoadingData = false;
      },
    );
  }

  isWithinDateRange(endDate: Date): boolean {
    const currentDate = new Date();
    return currentDate <= new Date(endDate);
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
    const searchTerm = (event.target as HTMLInputElement).value;
    this.dataSource.filter = searchTerm.trim().toLowerCase();
  }

  openConfirmDialog(packages: Package): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Estas seguro de querer eliminar este paquete?',
      message: 'El paquete será eliminado permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (packages.id) {
          this.deletePackage(packages);
        }
      }
    });
  }

  deletePackage(packages: Package) {
    if (packages.id) {
      this.packageService.deletePackageById(packages.id).subscribe(
        (response) => {
          // Update consumibleData
          this.packageData = this.packageData.filter(
            (c) => c.id !== packages.id,
          );
          // Update dataSource
          this.dataSource.data = this.packageData;
          this.toastService.showSuccess(
            'Paquete de renta eliminado con éxito',
            'Aceptar',
          );
        },
        (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
        },
      );
    }
  }
}
