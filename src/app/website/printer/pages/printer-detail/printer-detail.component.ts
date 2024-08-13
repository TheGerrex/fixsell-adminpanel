import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Printer } from 'src/app/website/interfaces/printer.interface';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PrinterService } from '../../services/printer.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-printer-detail',
  templateUrl: './printer-detail.component.html',
  styleUrls: ['./printer-detail.component.scss'],
})
export class PrinterDetailComponent implements OnInit {
  printer: Printer | null = null;
  currentImageIndex = 0;
  isLoadingData = false;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private sharedService: SharedService,
    private printerService: PrinterService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getPrinter();
  }

  getPrinter(): void {
    this.isLoadingData = true;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.printerService.getPrinter(id).subscribe((printer) => {
        this.printer = printer;
        console.log('Printer:', printer);
        this.sharedService.changePrinterModel(printer.model);
        this.isLoadingData = false;
      });
    }
  }

  getDealDuration(): number {
    if (this.printer && this.printer.deals) {
      const startDate = new Date(this.printer.deals[0].dealStartDate);
      const endDate = new Date(this.printer.deals[0].dealEndDate);
      const diff = endDate.getTime() - startDate.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/website', 'printers', id, 'edit']);
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
          this.deletePrinter(printer);
        }
      }
    });
  }

  deletePrinter(printer: Printer) {
    if (printer.id) {
      this.printerService.deletePrinter(printer.id).subscribe({
        next: (response) => {
          this.toastService.showSuccess(
            'Multifuncional eliminado con exito',
            'Aceptar',
          );
          this.router.navigateByUrl('website/printers');
        },
        error: (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
        },
      });
    }
  }
}
