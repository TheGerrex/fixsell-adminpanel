import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { PackageService } from '../../services/package.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Package } from 'src/app/website/interfaces/package.interface';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { TableColumn } from 'src/app/shared/components/data-table/data-table.component';

@Component({
  selector: 'app-package-list',
  templateUrl: './package-list.component.html',
  styleUrls: ['./package-list.component.scss'],
})
export class PackageListComponent implements OnInit {
  packageData: Package[] = [];
  isLoadingData = false;
  searchTerm = '';

  displayedColumns: string[] = [
    'model',
    'prints',
    'deposit',
    'monthlyPrice',
    'packageDuration',
    'packageEndDate',
    'action',
  ];

  columns: TableColumn[] = [
    {
      name: 'model',
      label: 'Modelo',
      sortable: true,
      formatter: (value: any, row: Package) => row.printer.model,
    },
    {
      name: 'prints',
      label: 'Impresiónes',
      formatter: (value: any, row: Package) => ({
        html: true,
        content: `<div style="display: flex; flex-direction: column">
                <div class="print-item">${this.formatPrints(
                  row.packagePrintsBw || 0,
                )} impresiones</div>
              </div>`,
      }),
    },
    {
      name: 'deposit',
      label: 'Deposito Inicial',
      sortable: true,
      formatter: (value: any, row: Package) =>
        `${this.formatCurrency(Number(row.packageDepositPrice))} ${
          row.packageCurrency
        }`,
    },
    {
      name: 'monthlyPrice',
      label: 'Pago Mensual',
      sortable: true,
      formatter: (value: any, row: Package) =>
        `$${row.packageMonthlyPrice} ${row.packageCurrency} (${row.packageDiscountPercentage}% de descuento)`,
    },
    {
      name: 'packageDuration',
      label: 'Duración de Contrato',
      sortable: true,
      formatter: (value: any, row: Package) => `${row.packageDuration} meses`,
    },
    {
      name: 'packageEndDate',
      label: 'Terminacion de paquete',
      sortable: true,
      formatter: (value: any, row: Package) => ({
        html: true,
        content: `<div class="end-date-container">
                    <span class="status-icon ${
                      this.isWithinDateRange(row.packageEndDate)
                        ? 'within-date-range'
                        : 'past-deal'
                    }"></span>
                    ${this.formatDate(row.packageEndDate)}
                  </div>`,
      }),
    },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private packageService: PackageService,
    private dialog: MatDialog,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoadingData = true;
    this.packageService.getAllPackages().subscribe(
      (data) => {
        this.packageData = data;
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

  formatPrints(value: number | string): string {
    // Make sure value is treated as a number
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericValue || 0); // Use 0 as fallback for null/undefined
  }

  formatCurrency(value: number | string): string {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue || 0);
  }

  formatDate(date: Date): string {
    // Convert to proper Date object if it's not already
    const dateObj = new Date(date);
    // Format the date - you can use a pipe in the template or format here
    return dateObj.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  addPackage() {
    this.router.navigate(['/website/packages/create']);
  }

  seePackage(pkg: Package) {
    this.router.navigateByUrl(`website/printers/${pkg.printer.id}`);
  }

  editPackage(pkg: Package) {
    this.router.navigateByUrl(`/website/packages/${pkg.id}/edit`);
  }

  openConfirmDialog(pkg: Package): void {
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
        if (pkg.id) {
          this.deletePackage(pkg);
        }
      }
    });
  }

  deletePackage(pkg: Package) {
    if (pkg.id) {
      this.packageService.deletePackageById(pkg.id).subscribe(
        (response) => {
          this.packageData = this.packageData.filter((p) => p.id !== pkg.id);
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
