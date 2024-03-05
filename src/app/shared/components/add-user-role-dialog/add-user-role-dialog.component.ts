import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-user-role-dialog',
  templateUrl: './add-user-role-dialog.component.html',
  styleUrls: ['./add-user-role-dialog.component.scss'],
})
export class AddUserRoleDialogComponent {
  roleName = new FormControl('', Validators.required);

  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<AddUserRoleDialogComponent>
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.roleName.valid) {
      this.http
        .post(`${environment.baseUrl}/roles`, {
          name: this.roleName.value,
        })
        .subscribe(() => {
          this.dialogRef.close(this.roleName.value);
        });
    }
  }
}
