import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastComponent } from '../components/toast/toast.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private snackBar: MatSnackBar) { }

  showSuccess(message: string, buttonText: string) {
    this.snackBar.openFromComponent(ToastComponent, {
      data: {
        title: 'Éxito',
        message: message,
        buttonText: buttonText,
        buttonColor: 'button-icon-success',
        iconColor: 'success-icon',
        borderColor: 'success-border',
        icon: 'done',
      },
      duration: 8000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-toast']
    });
  }

  showError(message: string, buttonText: string) {
    this.snackBar.openFromComponent(ToastComponent, {
      data: {
        title: 'Error',
        message: message,
        buttonText: buttonText,
        buttonColor: 'button-icon-danger',
        iconColor: 'error-icon',
        borderColor: 'error-border',
        icon: 'error',
      },
      duration: 8000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-toast']
    });
  }

  showWarning(message: string, buttonText: string) {
    this.snackBar.openFromComponent(ToastComponent, {
      data: {
        title: 'Advertencia',
        message: message,
        buttonText: buttonText,
        buttonColor: 'button-icon-warning',
        iconColor: 'warning-icon',
        borderColor: 'warning-border',
        icon: 'warning',
      },
      duration: 8000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['warning-toast']
    });
  }

  showInfo(message: string, buttonText: string) {
    this.snackBar.openFromComponent(ToastComponent, {
      data: {
        title: 'Informacion',
        message: message,
        buttonText: buttonText,
        buttonColor: 'button-icon-info',
        iconColor: 'info-icon',
        borderColor: 'info-border',
        icon: 'info',
      },
      duration: 8000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['info-toast']
    });
  }

  showHelp(message: string, buttonText: string) {
    this.snackBar.openFromComponent(ToastComponent, {
      data: {
        title: 'Ayuda',
        message: message,
        buttonText: buttonText,
        buttonColor: 'button-icon-help',
        iconColor: 'help-icon',
        borderColor: 'help-border',
        icon: 'info',
      },
      duration: 8000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['help-toast']
    });
  }
}
