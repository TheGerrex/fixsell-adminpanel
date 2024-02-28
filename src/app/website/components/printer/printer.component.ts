import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Consumible } from '../../interfaces/consumibles.interface';
import { Printer } from '../../interfaces/printer.interface';
import { ConsumiblesService } from '../../consumibles/services/consumibles.service';

@Component({
  selector: 'website-printer',
  templateUrl: './printer.component.html',
  styleUrls: ['./printer.component.scss']
})
export class PrinterComponent {
  constructor(
    private router: Router,
    private toastService: ToastService,
    private dialog: MatDialog,
    private consumiblesService: ConsumiblesService
  ) {}

  @Input() product!: Consumible;

  navigateToCreatePrinter() {
    this.router.navigate(['/website', 'printers', 'create']);
  }
  navigateToSeePrinter(id: string) {
    this.router.navigate(['/website/printers', id]);
  }
  navigateToEditPrinter(id: string) {
    this.router.navigate([`/website/printers/${id}/edit`]);
  }
  
  openConfirmDialog(consumableId: string): void {
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
        this.deletePrinter(consumableId)
      }
    });
  }

  deletePrinter(id: string): void {
    this.consumiblesService.deleteConsumible(id).subscribe(
      (response) => {
        // this.product.consumibles = this.product.consumibles.filter((consumible: Consumible) => consumible.id !== id);
        this.toastService.showSuccess('Consumible eliminado con exito', 'Aceptar');
      },
      (error) => {
        this.toastService.showError(error.error.message, 'Cerrar');
      }
    );
    
  }
}
