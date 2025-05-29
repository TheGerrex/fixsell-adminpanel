import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) { }

  openConfirmDialog(message: string, buttonText: string, panelClass: string) {
    return this.dialog.open(ConfirmDialogComponent, {
      panelClass: panelClass, // Add panelClass here
      data: {
        title: 'Confirm',
        message: message,
        buttonText: buttonText,
        buttonColor: 'button-icon-confirm',
        icon: 'check',
      },
    });
  }

  openErrorDialog(message: string, buttonText: string, panelClass: string) {
    return this.dialog.open(ConfirmDialogComponent, {
      panelClass: panelClass, // Add panelClass here
      data: {
        title: 'Error',
        message: message,
        buttonText: buttonText,
        buttonColor: 'button-icon-danger',
        icon: 'error',
      },
    });
  }

  // Add more dialog types as needed...
}
