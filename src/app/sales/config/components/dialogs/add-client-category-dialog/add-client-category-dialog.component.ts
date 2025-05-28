import { Component } from '@angular/core';
import { NewClientCategory } from '../../client-category-crud/client-category.interface';
import { ClientsService } from 'src/app/sales/clients/services/clients.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-client-category-dialog',
  templateUrl: './add-client-category-dialog.component.html',
  styleUrl: './add-client-category-dialog.component.scss'
})
export class AddClientCategoryDialogComponent {
  categoryName = new FormControl('', Validators.required);

  constructor(
    private clientService: ClientsService,
    private toastService: ToastService,
    public dialogRef: MatDialogRef<AddClientCategoryDialogComponent>
  ) { }

  get categoryNameError() {
    return this.categoryName.errors?.["serverError"];
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.categoryName.valid && this.categoryName.value !== null) {
      const category: NewClientCategory = {
        name: this.categoryName.value,
        isActive: true,
      }
      this.clientService.createClientCategory(category).subscribe({
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
