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
        title: 'Exito',
        message: message,
        buttonText: buttonText,
        buttonColor: 'button-icon-success',
        icon: 'done',
      },
      duration: 8000, 
      horizontalPosition: 'end', 
      verticalPosition: 'top',
      panelClass: ['success-toast']});
  }

  showError(message: string, buttonText: string) {
    this.snackBar.openFromComponent(ToastComponent, {
      data: {
        title: 'Error',
        message: message,
        buttonText: buttonText,
        buttonColor: 'button-icon-danger',
        icon: 'error',
      },
      duration: 8000, 
      horizontalPosition: 'end', 
      verticalPosition: 'top',
      panelClass: ['error-toast']});
  }

  showWarning(message: string, buttonText: string) {
    this.snackBar.openFromComponent(ToastComponent, {
      data: {
        title: 'Advertencia',
        message: message,
        buttonText: buttonText,
        buttonColor: 'button-icon-warning',
        icon: 'warning',
      },
      duration: 8000, 
      horizontalPosition: 'end', 
      verticalPosition: 'top',
      panelClass: ['warning-toast']});
  }

  showInfo(message: string, buttonText: string) {
    this.snackBar.openFromComponent(ToastComponent, {
      data: {
        title: 'Informacion',
        message: message,
        buttonText: buttonText,
        buttonColor: 'button-icon-info',
        icon: 'info',
      },
      duration: 8000, 
      horizontalPosition: 'end', 
      verticalPosition: 'top',
      panelClass: ['info-toast']});
  }

  showHelp(message: string, buttonText: string) {
    this.snackBar.openFromComponent(ToastComponent, {
      data: {
        title: 'Ayuda',
        message: message,
        buttonText: buttonText,
        buttonColor: 'button-icon-help',
        icon: 'info',
      },
      duration: 8000, 
      horizontalPosition: 'end', 
      verticalPosition: 'top',
      panelClass: ['help-toast']});
  }
}
