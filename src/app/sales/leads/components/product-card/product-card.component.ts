import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ConsumiblesService } from 'src/app/website/consumibles/services/consumibles.service';
import { Consumible } from 'src/app/website/interfaces/consumibles.interface';
import { Printer } from 'src/app/website/interfaces/printer.interface';
import { PrinterService } from 'src/app/website/printer/services/printer.service';
@Component({
  selector: 'lead-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent implements OnInit {
  constructor(
    private router: Router,
    private toastService: ToastService,
    private dialog: MatDialog,
    private consumiblesService: ConsumiblesService,
    private printerService: PrinterService,
  ) { }

  @Input() type_product!: string;
  @Input() product_name!: string;
  productData: Consumible | Printer | null = null;

  ngOnInit() {
    this.getProductData();
  }

  navigateToSeePrinter(id: string) {
    this.router.navigate(['/website/printers', id]);
  }

  getProductData(): void {
    if (this.type_product === 'consumible') {
      const consumibleName = this.product_name;
      this.consumiblesService.getConsumibleIdByName(consumibleName).pipe(
        switchMap((id: string) => this.consumiblesService.getConsumible(id))
      ).subscribe(
        (data) => {
          this.productData = data;
        },
        (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
        }
      );
    } else if (this.type_product === 'printer') {
      console.log(this.product_name);
      const printerName = this.product_name;
      this.printerService.getPrinterIdByName(printerName).pipe(
        switchMap((id: string) => {
          if (id) {
            return this.printerService.getPrinter(id);
          } else {
            // Handle the case where no printer with the given name is found
            this.toastService.showError(`No printer found with name ${printerName}`, 'Cerrar');
            return of(null);
          }
        })
      ).subscribe(
        (data) => {
          this.productData = data;
          console.log(data);
        },
        (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
        }
      );
    }
    console.log(this.type_product);
    console.log(this.productData);
  }

  isPrinter(product: Consumible | Printer): product is Printer {
    return (product as Printer).model !== undefined;
  }

  navigateToCreateConsumible() {
    this.router.navigate(['/website', 'consumibles', 'create']);
  }
  navigateToSeeConsumible(id: string) {
    this.router.navigate(['/website/consumibles', id]);
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
        // this.deleteConsumible(consumableId)
      }
    });
  }

  // deleteConsumible(id: string): void {
  //   this.consumiblesService.deleteConsumible(id).subscribe(
  //     (response) => {
  //       this.product.consumible = this.product.consumibles.filter((consumible: Consumible) => consumible.id !== id);
  //       this.toastService.showSuccess('Consumible eliminado con exito', 'Aceptar');
  //     },
  //     (error) => {
  //       this.toastService.showError(error.error.message, 'Cerrar');
  //     }
  //   );

  // }
}
