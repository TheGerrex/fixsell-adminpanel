import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Consumible } from 'src/app/website/interfaces/consumibles.interface';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ConsumiblesService } from '../../services/consumibles.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-consumibles-detail',
  templateUrl: './consumibles-detail.component.html',
  styleUrls: ['./consumibles-detail.component.scss'],
})
export class ConsumiblesDetailComponent implements OnInit {
  consumible: Consumible | null = null;
  currentImageIndex = 0;
  isLoadingData = false;

  constructor(
    private route: ActivatedRoute,
    private consumiblesService: ConsumiblesService,
    private toastService: ToastService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getConsumible();
  }

  prevImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  nextImage(): void {
    if (
      this.consumible &&
      this.currentImageIndex < this.consumible.img_url.length - 1
    ) {
      this.currentImageIndex++;
    }
  }

  getConsumible(): void {
    this.isLoadingData = true;
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.consumiblesService.getConsumible(id).subscribe((consumible) => {
          console.log(consumible);
          this.consumible = consumible;
          this.isLoadingData = false;
          // this.sharedService.changeConsumiblesModel(consumible.model);
        });
      }
    });
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/website', 'consumibles', id, 'edit']);
  }

  openConfirmDialog(consumible: Consumible): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Estas seguro de eliminar este consumible?',
      message: 'El consumible será eliminado permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (consumible.id) {
          this.deleteConsumible(consumible)
        }

      }
    });
  }

  deleteConsumible(consumible: Consumible) {
    if (consumible.id) {
      this.consumiblesService.deleteConsumible(consumible.id).subscribe(
        (response) => {
          this.toastService.showSuccess('Consumible eliminado con éxito', 'Aceptar');
          this.router.navigateByUrl('website/consumibles');
        },
        (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
        }
      );
    }
  }
}
