import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Deal } from '../../interfaces/deal.interface';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { DealService } from '../../deal/services/deal.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'website-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.scss']
})
export class DealsComponent {

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private toastService: ToastService,
    private dealService: DealService,
  ) { }

  @Input() deals!: Deal[];

  getDaysLeft(): number {
    if (this.deals) {
      const endDate = new Date(this.deals[0].dealEndDate);
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  navigateToCreateDeal() {
    this.router.navigate(['/website', 'deals', 'create']);
  }
  navigateToSeeDeal(id: string) {
    this.router.navigate(['/website/deals', id]);
  }
  navigateToEditDeal(id: string) {
    this.router.navigate([`/website/deals/${id}/edit`]);
  }

  openConfirmDialog(dealId: string): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Estas seguro de querer eliminar esta promoción?',
      message: 'La promoción será eliminado permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.deleteDeal(dealId)
      }
    });
  }

  deleteDeal(id: string): void {
    this.dealService.deleteDealById(id).subscribe(
      (response) => {
        this.deals = this.deals.filter((deal: Deal) => deal.id !== id);
        this.toastService.showSuccess('Promoción eliminado con éxito', 'Aceptar');
      },
      (error) => {
        this.toastService.showError(error.error.message, 'Cerrar');
      }
    );

  }
}