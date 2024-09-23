import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Consumible } from '../../interfaces/consumibles.interface';
import { ConsumiblesService } from '../../consumibles/services/consumibles.service';

@Component({
  selector: 'website-counterparts',
  templateUrl: './counterparts.component.html',
  styleUrls: ['./counterparts.component.scss'],
})
export class CounterpartsComponent implements OnInit {
  constructor(
    private router: Router,
    private toastService: ToastService,
    private dialog: MatDialog,
    private consumiblesService: ConsumiblesService,
  ) {}

  ngOnInit(): void {
    console.log(this.product);
  }

  @Input() product: any;

  navigateToCreateConsumible() {
    this.router.navigate(['/website', 'consumibles', 'create']);
  }
  navigateToSeeConsumible(id: string) {
    this.router.navigate([`/website/consumibles/${id}`]);
  }
  navigateToEditConsumible(id: string) {
    this.router.navigate([`/website/consumibles/${id}/edit`]);
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
        this.deleteConsumible(consumableId);
      }
    });
  }

  deleteConsumible(id: string): void {
    this.consumiblesService.deleteConsumible(id).subscribe(
      (response) => {
        this.product.consumibles = this.product.consumibles.filter(
          (consumible: Consumible) => consumible.id !== id,
        );
        this.toastService.showSuccess(
          'Consumible eliminado con éxito',
          'Aceptar',
        );
      },
      (error: any) => {
        this.toastService.showError(error.error.message, 'Cerrar');
      },
    );
  }
}
