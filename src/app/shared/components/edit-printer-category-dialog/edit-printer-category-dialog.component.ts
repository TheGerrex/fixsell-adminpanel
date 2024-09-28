import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CategoryService } from 'src/app/website/config/services/category.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'edit-printer-category-dialog',
  templateUrl: './edit-printer-category-dialog.component.html',
  styleUrl: './edit-printer-category-dialog.component.scss'
})
export class EditPrinterCategoryDialogComponent {
  categoryName = new FormControl('', Validators.required);

  constructor(
    private categoryService: CategoryService,
    private toastService: ToastService,
    public dialogRef: MatDialogRef<EditPrinterCategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.categoryName.setValue(data.categoryName);
  }


  get categoryNameError() {
    return this.categoryName.errors?.["serverError"];
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.categoryName.valid && this.categoryName.value !== null) {
      const category = {
        name: this.categoryName.value,
        // Add other brand properties here
      };
      this.categoryService.updateCategory(category, this.data.categoryId).subscribe({
        next: () => {
          this.toastService.showSuccess('Categoria actualizada con éxito', 'Close');
          this.dialogRef.close();
        },
        error: (error) => {
          this.categoryName.setErrors({ serverError: error.error.message });
        }
      });
    }
  }
}
