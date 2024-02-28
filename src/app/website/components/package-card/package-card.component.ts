import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PackageService } from '../../package/services/package.service';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Package } from '../../interfaces/printer.interface';

@Component({
  selector: 'website-package-card',
  templateUrl: './package-card.component.html',
  styleUrls: ['./package-card.component.scss'],
})
export class PackageCardComponent {
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private packageService: PackageService,
    private toastService: ToastService
  ) {}

  @Input() product: any;

  getDaysLeft(): number[] {
    if (this.product && this.product.packages) {
      return this.product.packages.map(
        (pkg: { packageEndDate: string | number | Date }) => {
          const endDate = new Date(pkg.packageEndDate);
          const now = new Date();
          const diff = endDate.getTime() - now.getTime();
          return Math.ceil(diff / (1000 * 60 * 60 * 24));
        }
      );
    }
    return [];
  }

  navigateToCreatePackage(id: number) {
    const url = ['/website', 'packages', 'create'];
    console.log('navigateToCreatePackage URL:', url);
    this.router.navigate(url);
  }

  navigateToPackageEdit(id: number) {
    const url = ['/website', 'packages', id, 'edit'];
    console.log('navigateToPackageEdit URL:', url);
    this.router.navigate(url);
  }

  openConfirmDialog(packageId: number): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Estas seguro de querer eliminar esta consumible?',
      message: 'El consumible sera eliminado permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.deletePackage(packageId);
      }
    });
  }

  deletePackage(id: number): void {
    const numericId = Number(id); // Convert the id from string to number
    this.packageService.deletePackageById(numericId).subscribe(
      (response) => {
        this.product.packages = this.product.consumibles.filter(
          (packages: Package) => packages.id !== numericId
        );
        this.toastService.showSuccess(
          'Consumible eliminado con exito',
          'Aceptar'
        );
      },
      (error) => {
        this.toastService.showError(error.error.message, 'Cerrar');
      }
    );
  }
}
