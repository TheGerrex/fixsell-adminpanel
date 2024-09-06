import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-printer-brand-dialog',
  templateUrl: './add-printer-brand-dialog.component.html',
  styleUrls: ['./add-printer-brand-dialog.component.scss'],
})
export class AddPrinterBrandDialogComponent {
  brandName = new FormControl('', Validators.required);

  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<AddPrinterBrandDialogComponent>
  ) { }

  get brandNameError() {
    return this.brandName.errors?.["serverError"];
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.brandName.valid) {
      this.http
        .post(`${environment.baseUrl}/brands/printers`, {
          name: this.brandName.value,
        })
        .subscribe(() => {
          this.dialogRef.close(this.brandName.value);
        });
    }
  }
}
