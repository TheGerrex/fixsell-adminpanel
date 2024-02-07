import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {
  public firstNameAndLastnamePattern: string = '([a-zA-Z]+) ([a-zA-Z]+)';
  public emailPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  public numberPattern: string = "^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$";
  public floatNumberPattern: string = "^[0-9]*\.?[0-9]+$";

  constructor() { }

  public isValidField(form: FormGroup, field: string): boolean|null {
    return form.controls[field].errors && form.controls[field].touched;
  }

  public fileValidator(control: FormControl): { [s: string]: boolean } {
    const file = control.value;
    if (file) {
      const fileSize = file.size / 1024 / 1024; // size in MB
      const fileType = file.type;
      if (fileSize > 5) {
        return { 'fileSize': true };
      }
      if (fileType !== 'application/pdf') {
        return { 'fileType': true };
      }
    }
    return {};
  }
}
