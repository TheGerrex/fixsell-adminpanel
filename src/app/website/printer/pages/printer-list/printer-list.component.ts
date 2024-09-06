import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Printer } from 'src/app/website/interfaces/printer.interface';
import { PrinterService } from '../../services/printer.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-printer-list',
  templateUrl: './printer-list.component.html',
  styleUrls: ['./printer-list.component.scss'],
})
export class PrinterListComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<Printer>();
  searchTerm = '';
  isAdmin = false;
  printerData: Printer[] = [];
  isLoadingData = false;
  displayedColumns: string[] = [
    'brand',
    'model',
    'rentable',
    'color',
    'category',
    'price',
    'action',
  ];


  constructor(
    private http: HttpClient,
    private router: Router,
    private printerService: PrinterService,
    private authService: AuthService,
    private toastService: ToastService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.loadData());
    const userRoles = this.authService.getCurrentUserRoles();
    this.isAdmin = userRoles.includes('admin');
    if (!this.isAdmin) {
      this.displayedColumns = [
        'brand',
        'model',
        'category',
        'price',
      ];
    }
  }

  loadData() {
    this.isLoadingData = true;
    this.printerService.getAllPrinters().subscribe((printers) => {
      this.printerData = printers;
      this.dataSource = new MatTableDataSource(printers);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.isLoadingData = false;
    }, (error) => {
      console.error('Error:', error);
      this.isLoadingData = false;
    });
  }

  applyFilter(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.dataSource.filter = searchTerm.trim().toLowerCase();
  }

  seePrinter(printer: Printer) {
    // Implement edit functionality here
    this.router.navigate([`/website/printers/${printer.id}`], {
      state: { printer },
    });
  }

  editPrinter(printer: Printer) {
    // Implement edit functionality here
    this.router.navigate([`/website/printers/${printer.id}/edit`], {
      state: { printer },
    });
  }

  openConfirmDialog(printer: Printer): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Estas seguro de eliminar esta multifuncional?',
      message: 'La multifuncional será eliminado permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (printer.id) {
          this.deletePrinter(printer)
        }

      }
    });
  }

  deletePrinter(printer: Printer) {
    if (printer.id) {
      this.printerService.deletePrinter(printer.id).subscribe(
        (response) => {
          // Update consumibleData
          this.printerData = this.printerData.filter((p) => p.id !== printer.id);

          // Update dataSource
          this.dataSource.data = this.printerData;
          this.toastService.showSuccess('Multifuncional eliminado con exito', 'Aceptar');
        },
        (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
        }
      );
    }
  }

  addPrinter() {
    this.router.navigate(['/website/printers/create']);
  }
}
