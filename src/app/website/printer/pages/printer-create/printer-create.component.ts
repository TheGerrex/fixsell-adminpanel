import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Printer } from 'src/app/website/interfaces/printer.interface';
import { PrinterService } from '../../services/printer.service';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { AddPrinterBrandDialogComponent } from 'src/app/shared/components/add-printer-brand-dialog/add-printer-brand-dialog.component';
import { AddPrinterCategoryDialogComponent } from 'src/app/shared/components/add-printer-category-dialog/add-printer-category-dialog.component';
@Component({
  selector: 'app-printer-create',
  templateUrl: './printer-create.component.html',
  styleUrls: ['./printer-create.component.scss'],
})
export class PrinterCreateComponent implements OnInit {
  public imageUrlsArray: string[] = [];
  printer: Printer | null = null;
  currentImageIndex = 0;
  isSubmitting = false;
  categories = [
    'Oficina',
    'Produccion',
    'Etiquetas',
    'Artes Graficas',
    'Inyeccion de Tinta',
    'Plotter',
  ];
  brands = ['Konica Minolta', 'Kyocera', 'Epson', 'Fuji', 'Audley', 'Prixato'];

  public createPrinterForm!: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private printerService: PrinterService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private validatorsService: ValidatorsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.getBrandsAndCategories();
  }

  getBrandsAndCategories(): void {
    this.printerService.getBrands().subscribe(
      (brands: string[]) => {
        this.brands = brands;
        console.log('brands:', brands);
      },
      (error) => {
        console.error('Error fetching brands', error);
      }
    );

    this.printerService.getCategories().subscribe(
      (categories: string[]) => {
        this.categories = categories;
      },
      (error) => {
        console.error('Error fetching categories', error);
      }
    );
  }
  initializeForm() {
    this.createPrinterForm = this.fb.group({
      brand: [null, Validators.required],
      model: [null, Validators.required],
      img_url: this.fb.array([]),
      datasheet_url: [''],
      description: [''],
      price: [
        '',
        [
          Validators.required,
          Validators.pattern(this.validatorsService.floatNumberPattern),
        ],
      ],
      currency: ['USD', Validators.required],
      category: [null, Validators.required],
      color: [false],
      rentable: [false],
      sellable: [false],
      tags: this.fb.array([]),
      powerConsumption: [''],
      dimensions: [''],
      printVelocity: [null],
      maxPrintSizeSimple: [''],
      maxPrintSize: [''],
      printSize: [''],
      maxPaperWeight: [null],
      duplexUnit: [false],
      paperSizes: [''],
      applicableOS: [''],
      printerFunctions: [''],
    });
  }

  getDealDuration(): number {
    if (this.printer && this.printer.deals) {
      const startDate = new Date(this.printer.deals[0].dealStartDate);
      const endDate = new Date(this.printer.deals[0].dealEndDate);
      const diff = endDate.getTime() - startDate.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  getDaysLeft(): number {
    if (this.printer && this.printer.deals) {
      const endDate = new Date(this.printer.deals[0].dealEndDate);
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  // In your parent component
  handleTagsUpdated(tags: any[]) {
    const tagsFormArray = this.createPrinterForm.get('tags') as FormArray;
    tagsFormArray.clear();
    tags.forEach((tag) => {
      if (tag.name) {
        tagsFormArray.push(new FormControl(tag.name));
      }
    });
  }

  get tagsControls() {
    return (this.createPrinterForm.get('tags') as FormArray).controls.map(
      (control) => control.value
    );
  }

  get tagValues() {
    return (this.createPrinterForm.get('tags') as FormArray).value;
  }

  prevImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  nextImage(): void {
    if (
      this.printer &&
      this.currentImageIndex < this.printer.img_url.length - 1
    ) {
      this.currentImageIndex++;
    }
  }

  onColorChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.createPrinterForm.get('color')?.setValue(target.checked);
  }

  onRentableChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.createPrinterForm.get('rentable')?.setValue(target.checked);
  }

  onSellableChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.createPrinterForm.get('sellable')?.setValue(target.checked);
  }

  onDuplexUnitChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.createPrinterForm.get('duplexUnit')?.setValue(target.checked);
  }

  isValidField(field: string): boolean | null {
    // console.log(this.validatorsService.isValidField(this.createPrinterForm, field))
    return this.validatorsService.isValidField(this.createPrinterForm, field);
  }

  getFieldError(field: string): string | null {
    if (!this.createPrinterForm.controls[field]) return null;

    const errors = this.createPrinterForm.controls[field].errors || {};

    console.log(errors);

    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido';
        case 'pattern':
          return 'Este campo esta en formato incorrecto';
        case 'maxlength':
          return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
        default:
          return 'Error desconocido';
      }
    }
    return null;
  }

  submitForm() {
    if (this.createPrinterForm.invalid) {
      console.log('Invalid form');
      console.log(this.createPrinterForm);
      this.createPrinterForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const formData = this.createPrinterForm.value;
    formData.price = formData.price.toString();
    // if (!formData.datasheet_url) {
    //   delete formData.datasheet_url;
    // }
    this.printerService.submitPrinterCreateForm(formData).subscribe(
      (response: Printer) => {
        this.isSubmitting = false;
        this.toastService.showSuccess('Multifuncional creada', 'Cerrar');
        this.router.navigate(['/website/printers', response.id]);
      },
      (error) => {
        this.isSubmitting = false;
        this.toastService.showError(error.error.message, 'Cerrar');
      }
    );
  }

  get images(): FormArray {
    return this.createPrinterForm.get('images') as FormArray;
  }

  onFileUploaded(event: any): void {
    const files = Array.isArray(event) ? event : [event]; // The event should be an array of uploaded files
    console.log('files', files);

    for (const file of files) {
      if (file) {
        const fileExtension = file.split('.').pop().toLowerCase();
        console.log('fileExtension', fileExtension);

        if (fileExtension === 'pdf') {
          // It's a PDF, so add it to the datasheet_url field
          const datasheetControl = this.createPrinterForm.get('datasheet_url');
          console.log('datasheetControl', datasheetControl);
          if (datasheetControl) {
            datasheetControl.setValue(file);
            console.log(
              'I have set the value for datasheet:',
              datasheetControl.value
            );
          }
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          // It's an image, so add it to the images field
          this.imageUrlsArray.push(file);
          console.log('imageUrlsArray', this.imageUrlsArray);

          // Get a reference to the img_url form array
          const imgUrlArray = this.createPrinterForm.get(
            'img_url'
          ) as FormArray;

          // Create a new control with the URL and push it to the form array
          imgUrlArray.push(this.fb.control(file));
          console.log(this.createPrinterForm);
        }
      }
    }

    // Handle images
    const imagesControl = this.createPrinterForm.get('images');
    if (imagesControl) {
      for (const imageUrl of this.imageUrlsArray) {
        // Check if the last image URL in the form array is not empty
        if (this.images.at(this.images.length - 1).value !== '') {
          // If it's not empty, add a new control to the form array
          this.addImage();
        }

        // Set the value of the last control in the form array to the image URL
        this.images.at(this.images.length - 1).setValue(imageUrl);
      }
    }
  }

  openConfirmDialog(index: number): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Eliminar imagen de la impresora',
      message: 'Estas seguro de querer eliminar esta imagen?',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.onRemove(index);
        this.toastService.showSuccess('Imagen eliminada con exito', 'Aceptar');
      }
    });
  }

  onRemove(index: number): void {
    console.log('remove image at index: ', index);

    const imageUrl = this.imageUrlsArray[index];
    console.log('imageUrl:', imageUrl);
    this.printerService.deleteImagePrinter(imageUrl).subscribe(
      (response) => {
        console.log('Image deleted successfully', response);
        this.toastService.showSuccess('Imagen borrada con éxito', 'Cerrar');
        this.imageUrlsArray.splice(index, 1); // Remove the image from the array

        // Update the form control
        const controlArray = <FormArray>this.createPrinterForm.get('img_url');
        controlArray.clear(); // Clear the existing form array
        this.imageUrlsArray.forEach((url) => {
          controlArray.push(new FormControl(url)); // Add the remaining URLs back to the form array
        });

        // this.removeImage(index);
      },
      (error) => {
        this.toastService.showError(error.error.message, 'Cerrar');
      }
    );
  }

  addImage(): void {
    this.images.push(this.fb.control(''));
  }

  removeImage(index: number): void {
    this.images.removeAt(index);
  }

  openBrandDialog() {
    const dialogRef = this.dialog.open(AddPrinterBrandDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);

      this.getBrandsAndCategories();
    });
  }

  openCategoryDialog() {
    const dialogRef = this.dialog.open(AddPrinterCategoryDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      this.getBrandsAndCategories();
    });
  }

  brandSelected(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement.value === 'addNew') {
      this.openBrandDialog();
      // Reset the select to the previous value or to an empty value
      this.createPrinterForm.controls['brand'].setValue('');
    }
  }

  categorySelected(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement.value === 'addNew') {
      this.openCategoryDialog();
      // Reset the select to the previous value or to an empty value
      this.createPrinterForm.controls['category'].setValue('');
    }
  }
}
