import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ValidatorsService {
  public firstNameAndLastnamePattern: string = '([a-zA-Z]+) ([a-zA-Z]+)';
  public emailPattern: string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  public numberPattern: string =
    '^(?:\\+\\d{1,3}\\s*)?(?=(?:\\D*\\d){10,13}\\D*$)[\\d\\s]+$';
  public floatNumberPattern: string = '^[0-9]*.?[0-9]+$';

  constructor() { }

  public isValidField(form: FormGroup, field: string): boolean | null {
    return form.controls[field].errors && form.controls[field].touched;
  }

  public fileValidator(control: FormControl): { [s: string]: boolean } {
    const file = control.value;
    if (file) {
      const fileSize = file.size / 1024 / 1024; // size in MB
      const fileType = file.type;
      if (fileSize > 5) {
        return { fileSize: true };
      }
      if (fileType !== 'application/pdf') {
        return { fileType: true };
      }
    }
    return {};
  }

  public passwordsMatch(pass1Name: string, pass2Name: string) {
    return (formGroup: FormGroup) => {
      const pass1Control = formGroup.controls[pass1Name];
      const pass2Control = formGroup.controls[pass2Name];

      if (pass1Control.value === pass2Control.value) {
        pass2Control.setErrors(null);
      } else {
        pass2Control.setErrors({ notMatch: true });
      }
    };
  }

  public isStrongPassword() {
    return (control: AbstractControl) => {
      const value = control.value;

      // If the password field is empty or untouched, pass the validation
      if (!value || !control.touched) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
        value,
      );

      const passwordValid =
        hasUpperCase &&
        hasLowerCase &&
        hasNumeric &&
        hasSpecialChar &&
        value.length >= 8;

      if (!passwordValid) {
        control.setErrors({ strongPassword: true });
        return { strongPassword: true };
      }

      return null;
    };
  }

  public phoneValidator() {
    return (control: AbstractControl) => {
      const value = control.value;

      const phoneValid = value.match(this.numberPattern);

      if (!phoneValid) {
        return { phoneInvalid: true };
      }

      return null;
    };
  }

  public getFieldError(form: FormGroup, field: string): string | null {
    if (!form.controls[field]) return null;
    const errors = form.controls[field].errors || {};
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido';
        case 'pattern':
          return 'Este campo está en formato incorrecto';
        case 'maxlength':
          return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
        case 'minlength':
          return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
        case 'email':
          return 'Este campo debe ser un email válido';
        case 'serverError':
          // Only show a message if it's a string or has a message property
          if (typeof errors['serverError'] === 'string') {
            return errors['serverError'];
          }
          if (
            errors['serverError'] &&
            typeof errors['serverError'] === 'object' &&
            errors['serverError'].message
          ) {
            return errors['serverError'].message;
          }
          // If it's just true or any other value, don't show a message
          break;
        case 'min':
          return `El precio tiene que ser minimo ${errors['min'].min}`;
        case 'phoneInvalid':
          return 'El número de teléfono debe tener 10 dígitos';
        case 'matDatepickerParse':
          return 'Fecha inválida';
        default:
          return 'Error desconocido';
      }
    }
    return null;
  }
}
