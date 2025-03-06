import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ConsumiblesService } from '../../services/consumibles.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Consumible } from 'src/app/website/interfaces/consumibles.interface';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { TableColumn } from 'src/app/shared/components/data-table/data-table.component';

@Component({
  selector: 'app-consumibles-list',
  templateUrl: './consumibles-list.component.html',
  styleUrls: ['./consumibles-list.component.scss'],
})
export class ConsumiblesListComponent implements OnInit {
  consumibleData: Consumible[] = [];
  isLoadingData = false;

  displayedColumns: string[] = [
    'name',
    'sku',
    'brand',
    'yield',
    'origen',
    'price',
    'category',
    'action',
  ];

  columns: TableColumn[] = [
    {
      name: 'name',
      label: 'Nombre',
      sortable: true,
    },
    {
      name: 'sku',
      label: 'SKU',
      sortable: true,
    },
    {
      name: 'brand',
      label: 'Fabricante',
      sortable: true,
    },
    {
      name: 'yield',
      label: 'Vida Util',
      sortable: true,
      formatter: (value: any, row: Consumible) =>
        value ? `${value} paginas` : '',
    },
    {
      name: 'origen',
      label: 'Origen',
      sortable: true,
    },
    {
      name: 'price',
      label: 'Precio',
      sortable: true,
      // align: 'right',
      formatter: (value: any, row: Consumible) => `${value} ${row.currency}`,
    },
    {
      name: 'category',
      label: 'Categoria',
      sortable: true,
    },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private toastService: ToastService,
    private consumiblesService: ConsumiblesService,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoadingData = true;
    this.consumiblesService.getAllConsumibles().subscribe(
      (consumibles) => {
        this.consumibleData = consumibles;
        this.isLoadingData = false;
      },
      (error) => {
        console.error('Error:', error);
        this.isLoadingData = false;
      },
    );
  }

  addConsumible() {
    this.router.navigateByUrl('website/consumibles/create');
  }

  seeConsumible(consumible: Consumible) {
    this.router.navigateByUrl(`website/consumibles/${consumible.id}`);
  }

  editConsumible(consumible: Consumible) {
    this.router.navigateByUrl(`website/consumibles/${consumible.id}/edit`);
  }

  openConfirmDialog(consumible: Consumible): void {
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
        if (consumible.id) {
          this.deleteConsumible(consumible);
        }
      }
    });
  }

  deleteConsumible(consumible: Consumible) {
    if (consumible.id) {
      this.consumiblesService.deleteConsumible(consumible.id).subscribe(
        (response) => {
          this.consumibleData = this.consumibleData.filter(
            (c) => c.id !== consumible.id,
          );
          this.toastService.showSuccess(
            'Consumible eliminado con éxito',
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
