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
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSelectChange } from '@angular/material/select';
import { AddPrinterCategoryDialogComponent } from 'src/app/shared/components/add-printer-category-dialog/add-printer-category-dialog.component';
import { AddPrinterBrandDialogComponent } from 'src/app/shared/components/add-printer-brand-dialog/add-printer-brand-dialog.component';

@Component({
  selector: 'app-printer-edit',
  templateUrl: './printer-edit.component.html',
  styleUrls: ['./printer-edit.component.scss'],
})
export class PrinterEditComponent implements OnInit {
  public imageUrlsArray: string[] = [];
  printer: Printer | null = null;
  currentImageIndex = 0;
  isLoadingData = false;
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

  public editPrinterForm!: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private printerService: PrinterService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private validatorsService: ValidatorsService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.getPrinter();
    this.getBrandsAndCategories();
  }

  initializeForm() {
    this.editPrinterForm = this.fb.group({
      brand: [this.printer ? this.printer.brand : '', Validators.required],
      model: [this.printer ? this.printer.model : '', Validators.required],
      datasheet_url: [this.printer ? this.printer.datasheet_url : ''],
      img_url: this.fb.array(this.printer ? this.printer.img_url : []),
      description: [this.printer ? this.printer.description : ''],
      price: [
        this.printer ? this.printer.price : '',
        [
          Validators.required,
          Validators.pattern(this.validatorsService.floatNumberPattern),
        ],
      ],
      currency: [
        this.printer ? this.printer.currency : 'MXN',
        Validators.required,
      ],
      category: [
        this.printer ? this.printer.category : '',
        Validators.required,
      ],
      color: [this.printer ? this.printer.color : false],
      rentable: [this.printer ? this.printer.rentable : false],
      sellable: [this.printer ? this.printer.sellable : false],
      tags: this.fb.array(
        (this.printer && this.printer.tags.length > 0
          ? this.printer.tags
          : []
        ).map((tag) => this.fb.control(tag)),
      ),
      powerConsumption: [this.printer ? this.printer.powerConsumption : ''],
      dimensions: [this.printer ? this.printer.dimensions : ''],
      printVelocity: [this.printer ? this.printer.printVelocity : null],
      maxPrintSizeSimple: [this.printer ? this.printer.maxPrintSizeSimple : ''],
      maxPrintSize: [this.printer ? this.printer.maxPrintSize : ''],
      printSize: [this.printer ? this.printer.printSize : ''],
      maxPaperWeight: [this.printer ? this.printer.maxPaperWeight : null],
      duplexUnit: [this.printer ? this.printer.duplexUnit : false],
      paperSizes: [this.printer ? this.printer.paperSizes : ''],
      applicableOS: [this.printer ? this.printer.applicableOS : ''],
      printerFunctions: [this.printer ? this.printer.printerFunctions : ''],
    });
  }

  getPrinter(): void {
    this.isLoadingData = true;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.printerService.getPrinter(id).subscribe((printerResponse) => {
        this.printer = printerResponse;
        this.imageUrlsArray = [...this.printer.img_url];
        this.initializeForm();
        console.log(this.printer);
        console.log(this.printer.model);
        this.sharedService.changePrinterModel(printerResponse.model);
        this.isLoadingData = false;
      });
    }
  }

  getBrandsAndCategories(): void {
    this.printerService.getBrands().subscribe((brands: string[]) => {
      this.brands = brands;
    });

    this.printerService.getCategories().subscribe((categories: string[]) => {
      this.categories = categories;
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
    const tagsFormArray = this.editPrinterForm.get('tags') as FormArray;
    tagsFormArray.clear();
    tags.forEach((tag) => tagsFormArray.push(new FormControl(tag.name)));
  }

  get tagsControls() {
    return (this.editPrinterForm.get('tags') as FormArray).controls;
  }

  get tagValues() {
    return (this.editPrinterForm.get('tags') as FormArray).value;
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

  onColorChange(event: MatSlideToggleChange) {
    this.editPrinterForm.get('color')?.setValue(event.checked);
  }

  onRentableChange(event: MatSlideToggleChange) {
    this.editPrinterForm.get('rentable')?.setValue(event.checked);
  }

  onSellableChange(event: MatSlideToggleChange) {
    this.editPrinterForm.get('sellable')?.setValue(event.checked);
  }

  onDuplexUnitChange(event: MatSlideToggleChange) {
    this.editPrinterForm.get('duplexUnit')?.setValue(event.checked);
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.editPrinterForm, field);
  }

  getFieldError(field: string): string | null {
    return this.validatorsService.getFieldError(this.editPrinterForm, field);
  }

  submitForm() {
    if (this.editPrinterForm.invalid) {
      console.log('Invalid form');
      console.log(this.editPrinterForm);
      this.editPrinterForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    let formData = this.editPrinterForm.value;
    formData.price = formData.price.toString();
    const printerId = this.route.snapshot.paramMap.get('id');
    if (printerId === null) {
      console.error('Printer id is null');
      return;
    }

    // Convert images to img_url and datasheet to datasheet_url
    if (formData.images) {
      formData.img_url = formData.images;
      delete formData.images;
    }
    if (formData.datasheet) {
      formData.datasheet_url = formData.datasheet;
      delete formData.datasheet;
    }

    this.printerService.submitPrinterEditForm(formData, printerId).subscribe(
      (response) => {
        this.isSubmitting = false;
        this.toastService.showSuccess('Multifuncional editada', 'Cerrar');
        this.router.navigate(['/website/printers', printerId]);
      },
      (error) => {
        this.isSubmitting = false;
        this.toastService.showError(error.error.message, 'Cerrar');
      },
    );
  }

  get images(): FormArray {
    return this.editPrinterForm.get('images') as FormArray;
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
          const datasheetControl = this.editPrinterForm.get('datasheet_url');
          console.log('datasheetControl', datasheetControl);
          if (datasheetControl) {
            datasheetControl.setValue(file);
            console.log(
              'I have set the value for datasheet:',
              datasheetControl.value,
            );
          }
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          // It's an image, so add it to the images field
          this.imageUrlsArray.push(file);
          console.log('imageUrlsArray', this.imageUrlsArray);

          // Get a reference to the img_url form array
          const imgUrlArray = this.editPrinterForm.get('img_url') as FormArray;

          // Create a new control with the URL and push it to the form array
          imgUrlArray.push(this.fb.control(file));
          console.log(this.editPrinterForm);
        }
      }
    }

    // Handle images
    const imagesControl = this.editPrinterForm.get('images');
    if (imagesControl) {
      for (const imageUrl of this.imageUrlsArray) {
        // Check if the images FormArray is empty or the last image URL in the form array is not empty
        if (
          this.images.length === 0 ||
          this.images.at(this.images.length - 1).value !== ''
        ) {
          // If it's empty or the last control is not empty, add a new control to the form array
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
      title: 'Estas seguro de querer eliminar esta imagen?',
      message: 'La imagen sera eliminada permanentemente.',
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
        const controlArray = <FormArray>this.editPrinterForm.get('img_url');
        controlArray.clear(); // Clear the existing form array
        this.imageUrlsArray.forEach((url) => {
          controlArray.push(new FormControl(url)); // Add the remaining URLs back to the form array
        });

        // this.removeImage(index);
      },
      (error) => {
        this.toastService.showError(error.error.message, 'Cerrar');
      },
    );
  }

  addImage(): void {
    this.images.push(this.fb.control(''));
  }

  removeImage(index: number): void {
    const imagesControl = this.editPrinterForm.get('images') as FormArray;
    if (imagesControl) {
      imagesControl.removeAt(index);
    }
    // object after removing the image
    console.log('object after removing image.', this.editPrinterForm);
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

  brandSelected(event: MatSelectChange) {
    if (event.value === 'addNew') {
      this.openBrandDialog();
      // Reset the select to the previous value or to an empty value
      this.editPrinterForm.controls['brand'].setValue('');
    }
  }

  categorySelected(event: MatSelectChange) {
    if (event.value === 'addNew') {
      this.openCategoryDialog();
      // Reset the select to the previous value or to an empty value
      this.editPrinterForm.controls['category'].setValue('');
    }
  }
}
