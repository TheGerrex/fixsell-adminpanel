import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Printer } from 'src/app/website/interfaces/printer.interface';
import { PrinterService } from '../../services/printer.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { TableColumn } from 'src/app/shared/components/data-table/data-table.component';

@Component({
  selector: 'app-printer-list',
  templateUrl: './printer-list.component.html',
  styleUrls: ['./printer-list.component.scss'],
})
export class PrinterListComponent implements OnInit {
  printerData: Printer[] = [];
  isLoadingData = false;
  searchTerm = '';

  // Define the columns for the data table
  displayedColumns: string[] = [
    'brand',
    'model',
    'rentable',
    'color',
    'category',
    'price',
    'action',
  ];

  columns: TableColumn[] = [
    {
      name: 'brand',
      label: 'Marca',
      sortable: true,
    },
    {
      name: 'model',
      label: 'Modelo',
      sortable: true,
    },
    {
      name: 'rentable',
      label: 'Tipo',
      formatter: (value: any, row: Printer) =>
        row.rentable ? 'Renta' : 'Venta',
    },
    {
      name: 'color',
      label: 'Modo de Impresión',
      formatter: (value: any, row: Printer) => (row.color ? 'Color' : 'B&N'),
    },
    {
      name: 'category',
      label: 'Categoria',
      sortable: true,
    },
    {
      name: 'price',
      label: 'Precio',
      // align: 'right',
      sortable: true,
      formatter: (value: any, row: Printer) => `$${row.price} ${row.currency}`,
    },
  ];

  constructor(
    private router: Router,
    private printerService: PrinterService,
    private authService: AuthService,
    private toastService: ToastService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoadingData = true;
    this.printerService.getAllPrinters().subscribe(
      (printers) => {
        this.printerData = printers;
        this.isLoadingData = false;
      },
      (error) => {
        console.error('Error:', error);
        this.isLoadingData = false;
      },
    );
  }

  seePrinter(printer: Printer) {
    this.router.navigate([`/website/printers/${printer.id}`], {
      state: { printer },
    });
  }

  editPrinter(printer: Printer) {
    this.router.navigate([`/website/printers/${printer.id}/edit`], {
      state: { printer },
    });
  }

  openConfirmDialog(printer: Printer): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: '¿Estás seguro de eliminar esta multifuncional?',
      message: 'La multifuncional será eliminada permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (printer.id) {
          this.deletePrinter(printer);
        }
      }
    });
  }

  deletePrinter(printer: Printer) {
    if (printer.id) {
      this.printerService.deletePrinter(printer.id).subscribe(
        (response) => {
          this.printerData = this.printerData.filter(
            (p) => p.id !== printer.id,
          );
          this.toastService.showSuccess(
            'Multifuncional eliminada con éxito',
            'Aceptar',
          );
        },
        (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
        },
      );
    }
  }

  addPrinter() {
    this.router.navigate(['/website/printers/create']);
  }

  // This handles row clicks - often not needed if you have action buttons
  onRowClick(row: Printer): void {
    this.router.navigate([`/website/printers/${row.id}`], {
      state: { printer: row },
    });
  }
}
