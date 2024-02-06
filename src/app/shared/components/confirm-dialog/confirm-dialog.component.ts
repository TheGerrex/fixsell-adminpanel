import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h1 mat-dialog-title>{{data.title}}</h1>
    <div mat-dialog-content>
      <p>{{ data.message }}</p>
    </div>
    <div mat-dialog-actions class="d-flex justify-content-between">
      <button class="button button-secondary button-raised" (click)="onCancel()"><span class="button-label">{{data.buttonText.cancel}}</span></button>
      <button class="button button-danger button-raised" (click)="onConfirm()"><mat-icon>delete</mat-icon> <span class="button-label">{{data.buttonText.ok}}</span> </button>
    </div>
  `,
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}