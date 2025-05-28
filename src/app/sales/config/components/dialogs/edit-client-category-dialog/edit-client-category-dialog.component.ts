import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientsService } from 'src/app/sales/clients/services/clients.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { NewClientCategory as DialogClientCategory } from '../../client-category-crud/client-category.interface';
import { ClientCategory as ServiceClientCategory } from 'src/app/sales/clients/interfaces/client.interface';


@Component({
  selector: 'app-edit-client-category-dialog',
  templateUrl: './edit-client-category-dialog.component.html',
  styleUrl: './edit-client-category-dialog.component.scss'
})
export class EditClientCategoryDialogComponent {
  categoryName = new FormControl('', Validators.required);
  isActive = new FormControl(false);

  constructor(
    private clientService: ClientsService,
    private toastService: ToastService,
    public dialogRef: MatDialogRef<EditClientCategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string; categoryName: string; isActive: boolean }
  ) {
    // Initialize form controls with the passed data
    if (data) {
      this.categoryName.setValue(data.categoryName);
      this.isActive.setValue(data.isActive);
    }
  }

  get categoryNameError() {
    return this.categoryName.errors?.["serverError"];
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.categoryName.valid && this.categoryName.value !== null) {
      const category: DialogClientCategory = {
        name: this.categoryName.value,
        isActive: this.isActive.value !== null ? this.isActive.value : true,
      }

      const serviceCategory: ServiceClientCategory = this.mapToServiceClientCategory(category);

      this.clientService.updateClientCategory(this.data.id, serviceCategory).subscribe({
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

  private mapToServiceClientCategory(category: DialogClientCategory): ServiceClientCategory {
    return {
      name: category.name,
      isActive: category.isActive,
      // Do not touch createdAt and updatedAt; let the backend handle them
    } as ServiceClientCategory;
  }
}
