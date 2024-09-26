import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
import { BrandService } from '../../../website/config/services/brand.service';

@Component({
  selector: 'edit-printer-brand-dialog',
  templateUrl: './edit-printer-brand-dialog.component.html',
  styleUrl: './edit-printer-brand-dialog.component.scss'
})
export class EditPrinterBrandDialogComponent {
  brandName = new FormControl('', Validators.required);


  constructor(
    private brandService: BrandService,
    private toastService: ToastService,
    public dialogRef: MatDialogRef<EditPrinterBrandDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('data', data);
    this.brandName.setValue(data.brandName);
  }

  get brandNameError() {
    return this.brandName.errors?.["serverError"];
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.brandName.valid && this.brandName.value !== null) {
      const brand = {
        id: this.data.brandId,
        name: this.brandName.value,
        // Add other brand properties here
      };
      this.brandService.updateBrand(brand, this.data.brandId).subscribe({
        next: () => {
          this.toastService.showSuccess('Marca actualizada con éxito', 'Close');
          this.dialogRef.close();
        },
        error: (error) => {
          this.brandName.setErrors({ serverError: error.error.message });
        }
      });
    }
  }
}
