import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { ToastService } from './../../../../shared/services/toast.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Consumible } from 'src/app/website/interfaces/consumibles.interface';
import { FileUploadComponent } from 'src/app/shared/components/file-upload/file-upload.component';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PackageService } from '../../services/package.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import {
  Observable,
  map,
  startWith,
  combineLatest,
  switchMap,
  of,
  from,
} from 'rxjs';

@Component({
  selector: 'app-package-create',
  templateUrl: './package-create.component.html',
  styleUrls: ['./package-create.component.scss'],
})
export class PackageCreateComponent implements OnInit {
  public createPackageForm!: FormGroup;
  printerNames$: Observable<string[]> = new Observable<string[]>();
  filteredPrinterNames$: Observable<string[]> | undefined;
  printerControl = new FormControl();
  constructor(
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private validatorsService: ValidatorsService,
    private PackageService: PackageService
  ) {}

  ngOnInit(): void {
    this.initalizeForm();
    this.printerNames$ = this.PackageService.getAllPrinterNames();

    // Use the _filter function inside the map operator
    this.filteredPrinterNames$ = this.printerControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) => from(this._filter(value))) // Convert Promise<string[]> to Observable<string[]>
    );
  }

  private async _filter(value: string): Promise<string[]> {
    const filterValue = value.toLowerCase();
    const printerNames = await this.printerNames$.toPromise();
    return (
      printerNames?.filter((printerName) =>
        printerName.toLowerCase().includes(filterValue)
      ) ?? []
    );
  }

  initalizeForm() {
    this.createPackageForm = this.fb.group({
      printer: ['', Validators.required],
      packageDuration: [0, [Validators.required, Validators.min(1)]],
      packageStartDate: ['', Validators.required],
      packageEndDate: ['', Validators.required],
      packagePrice: [0, [Validators.required, Validators.min(0.01)]],
      packageDiscountPercentage: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      packageDescription: ['', Validators.required],
      packagePrints: [0, [Validators.required, Validators.min(1)]],
      packageExtraClickPrice: [0, [Validators.required, Validators.min(0.01)]],
    });
  }

  submitForm(): void {
    if (this.createPackageForm.valid) {
      // TODO: Implement your package creation logic here
      console.log(this.createPackageForm.value);
    }
  }
}
