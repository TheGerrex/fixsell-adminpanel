import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'shared-simple-input-dialog',
  templateUrl: './simple-input-dialog.component.html',
  styleUrls: ['./simple-input-dialog.component.scss']
})
export class SimpleInputDialogComponent implements OnInit {
  form!: FormGroup;
  fields: any[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SimpleInputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.fields = this.data.fields || [];
    const group: any = {};
    this.fields.forEach(field => {
      group[field.name] = ['', field.validators || []];
    });
    this.form = this.fb.group(group);
    if (this.data.initialValues) {
      this.form.patchValue(this.data.initialValues);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}