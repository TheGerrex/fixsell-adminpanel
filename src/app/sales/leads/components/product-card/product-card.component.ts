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
  isLoading = false;

  ngOnInit() {
    this.getProductData();
  }

  navigateToSeeProduct(type: string, id: string) {
    if (type === 'printer') {
      this.router.navigate(['/website/printers', id]);
    } else if (type === 'consumible') {
      this.router.navigate(['/website/consumibles', id]);
    }
  }

  getProductData(): void {
    this.isLoading = true;
    if (this.type_product === 'consumible') {
      const consumibleName = this.product_name;
      this.consumiblesService.getConsumibleIdByName(consumibleName).pipe(
        switchMap((id: string) => this.consumiblesService.getConsumible(id))
      ).subscribe(
        (data) => {
          this.productData = data;
          this.isLoading = false;
        },
        (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
          this.isLoading = false;
        }
      );
    } else if (this.type_product === 'printer') {
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
          this.isLoading = false;
        },
        (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
          this.isLoading = false;
        }
      );
    }
    console.log(this.type_product);
    console.log(this.productData);
  }

  isPrinter(product: Consumible | Printer): product is Printer {
    return (product as Printer).model !== undefined;
  }
  isConsumable(product: Consumible | Printer): product is Consumible {
    return (product as Consumible).name !== undefined;
  }
}
