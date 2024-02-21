import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-printer-category-dialog',
  templateUrl: './add-printer-category-dialog.component.html',
  styleUrls: ['./add-printer-category-dialog.component.scss'],
})
export class AddPrinterCategoryDialogComponent {
  categoryName = new FormControl('', Validators.required);

  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<AddPrinterCategoryDialogComponent>
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.categoryName.valid) {
      this.http
        .post(`${environment.baseUrl}/categories/printers`, {
          name: this.categoryName.value,
        })
        .subscribe(() => {
          this.dialogRef.close(this.categoryName.value);
        });
    }
  }
}
