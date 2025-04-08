import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnInit {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
    public snackBarRef: MatSnackBarRef<ToastComponent>,
  ) {}

  ngOnInit(): void {}

  actionClick(): void {
    if (this.data.action && typeof this.data.action === 'function') {
      this.data.action();
      this.snackBarRef.dismiss();
    }
  }
}
