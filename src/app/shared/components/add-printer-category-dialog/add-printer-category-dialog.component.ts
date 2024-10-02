import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NewCategory } from 'src/app/website/config/components/printer-tab/categories-crud/categories.interface';
import { ToastService } from '../../services/toast.service';
import { CategoryService } from 'src/app/website/config/services/category.service';

@Component({
  selector: 'app-add-printer-category-dialog',
  templateUrl: './add-printer-category-dialog.component.html',
  styleUrls: ['./add-printer-category-dialog.component.scss'],
})
export class AddPrinterCategoryDialogComponent {
  categoryName = new FormControl('', Validators.required);

  constructor(
    private toastService: ToastService,
    private categoryService: CategoryService,
    public dialogRef: MatDialogRef<AddPrinterCategoryDialogComponent>
  ) { }


  get categoryNameError() {
    return this.categoryName.errors?.["serverError"];
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.categoryName.valid && this.categoryName.value !== null) {
      const brand: NewCategory = {
        name: this.categoryName.value
      }
      this.categoryService.createCategory(brand).subscribe({
        next: () => {
          this.toastService.showSuccess('Categoria creada con éxito', 'Close');
          this.dialogRef.close();
        },
        error: (error) => {
          this.categoryName.setErrors({ serverError: error.error.message });
        }
      });
    }
  }
}
