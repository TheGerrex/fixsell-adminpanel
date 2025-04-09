import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DealService } from '../../services/deal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Deal } from 'src/app/website/interfaces/deal.interface';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { TableColumn } from 'src/app/shared/components/data-table/data-table.component';

@Component({
  selector: 'app-deal-list',
  templateUrl: './deal-list.component.html',
  styleUrls: ['./deal-list.component.scss'],
})
export class DealListComponent implements OnInit {
  dealData: Deal[] = [];
  isLoadingData = false;
  searchTerm = '';

  displayedColumns: string[] = [
    'productType',
    'productName',
    'regularPrice',
    'dealPrice',
    'dealEndDate',
    'action',
  ];

  columns: TableColumn[] = [
    {
      name: 'productType',
      label: 'Producto',
      type: 'select',
      showFilter: true,
      sortable: true,
      formatter: (value: any, row: Deal) =>
        row.printer ? 'Multifuncional' : 'Consumible',
    },
    {
      name: 'productName',
      label: 'Nombre',
      type: 'input',
      showFilter: true,
      sortable: true,
      formatter: (value: any, row: Deal) =>
        row.printer
          ? row.printer.model
          : row.consumible
            ? row.consumible.name
            : 'N/A',
    },
    {
      name: 'regularPrice',
      label: 'Precio',
      type: 'input',
      showFilter: false,
      sortable: true,
      formatter: (value: any, row: Deal) => {
        let price = '0';
        let currency = 'MXN';

        if (row.printer) {
          price = row.printer.price.toString();
          currency = row.printer.currency;
        } else if (row.consumible) {
          price = row.consumible.price.toString();
          currency = row.consumible.currency;
        }

        return `$${price} ${currency}`;
      },
    },
    {
      name: 'dealPrice',
      label: 'Precio Promoción',
      type: 'input',
      showFilter: false,
      sortable: true,
      formatter: (value: any, row: Deal) =>
        `$${row.dealPrice} ${row.dealCurrency} (${row.dealDiscountPercentage}% de descuento)`,
    },
    {
      name: 'dealEndDate',
      label: 'Terminación de promoción',
      type: 'date',
      showFilter: false,
      sortable: true,
      formatter: (value: any, row: Deal) => {
        if (!row.dealEndDate) return 'Sin fecha de terminación';

        return {
          html: true,
          content: `<div class="end-date-container">
                      <span class="status-icon ${this.isWithinDateRange(row.dealEndDate)
              ? 'within-date-range'
              : 'past-deal'
            }"></span>
                      ${this.formatDate(row.dealEndDate)}
                    </div>`,
        };
      },
    },
  ];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private toastService: ToastService,
    private dealService: DealService,
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoadingData = true;
    this.dealService.getAllDeals().subscribe(
      (deals) => {
        // Filter out deals without printer or consumible and format dates
        this.dealData = deals
          .filter(
            (deal: Deal) => deal.printer !== null || deal.consumible !== null,
          )
          .map((deal: Deal) => ({
            ...deal,
            dealEndDate: deal.dealEndDate ? new Date(deal.dealEndDate) : null,
          }));

        this.isLoadingData = false;
      },
      (error) => {
        console.error('Error loading deals:', error);
        this.isLoadingData = false;
      },
    );
  }

  isWithinDateRange(endDate: Date | null): boolean {
    if (!endDate) return false;
    const currentDate = new Date();
    return currentDate <= new Date(endDate);
  }

  formatDate(date: Date | null): string {
    // Format the date in Spanish locale with capitalized first letter
    if (!date) return '';

    const dateString = new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // Capitalize first letter
    return dateString.charAt(0).toUpperCase() + dateString.slice(1);
  }

  seeDeal(deal: Deal) {
    this.router.navigate([`/website/deals/${deal.id}`], {
      state: { deal },
    });
  }

  editDeal(deal: Deal) {
    this.router.navigate([`/website/deals/${deal.id}/edit`], {
      state: { deal },
    });
  }

  addDeal() {
    this.router.navigate(['/website/deals/create']);
  }

  openConfirmDialog(deal: Deal): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Estas seguro de eliminar esta promoción?',
      message: 'La promoción será eliminado permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (deal.id) {
          this.deleteDeal(deal);
        }
      }
    });
  }

  deleteDeal(deal: Deal) {
    if (deal.id) {
      this.dealService.deleteDealById(deal.id).subscribe(
        (response) => {
          this.dealData = this.dealData.filter((d) => d.id !== deal.id);
          this.toastService.showSuccess(
            'Promoción eliminado con éxito',
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
