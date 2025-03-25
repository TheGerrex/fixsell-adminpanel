import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'shared-new-ticket-dialog',
  templateUrl: './new-ticket-dialog.component.html',
  styleUrl: './new-ticket-dialog.component.scss'
})
export class NewTicketDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<NewTicketDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
