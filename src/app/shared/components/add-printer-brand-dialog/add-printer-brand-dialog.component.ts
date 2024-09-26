import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { BrandService } from 'src/app/website/config/services/brand.service';
import { ToastService } from '../../services/toast.service';
import { NewBrand } from 'src/app/website/config/components/printer-tab/brand-crud/brand.interface';

@Component({
  selector: 'app-add-printer-brand-dialog',
  templateUrl: './add-printer-brand-dialog.component.html',
  styleUrls: ['./add-printer-brand-dialog.component.scss'],
})
export class AddPrinterBrandDialogComponent {
  brandName = new FormControl('', Validators.required);

  constructor(
    private brandService: BrandService,
    private toastService: ToastService,
    public dialogRef: MatDialogRef<AddPrinterBrandDialogComponent>
  ) { }

  get brandNameError() {
    return this.brandName.errors?.["serverError"];
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.brandName.valid && this.brandName.value !== null) {
      const brand: NewBrand = {
        name: this.brandName.value
      }
      this.brandService.createBrand(brand).subscribe({
        next: () => {
          this.toastService.showSuccess('Marca creada con éxito', 'Close');
          this.dialogRef.close();
        },
        error: (error) => {
          this.brandName.setErrors({ serverError: error.error.message });
        }
      });
    }
  }
}
