import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Printer } from 'src/app/website/interfaces/printer.interface';
import { PrinterService } from '../../services/printer.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-printer-create',
  templateUrl: './printer-create.component.html',
  styleUrls: ['./printer-create.component.scss']
})
export class PrinterCreateComponent implements OnInit{
  public imageUrlsArray: string[] = [];
  printer: Printer | null = null;
  currentImageIndex = 0;
  categories = [
    'Oficina',
    'Produccion',
    'Etiquetas',
    'Artes Graficas',
    'Inyeccion de Tinta',
  ];
  brands = ['Konica Minolta', 'Kyocera', 'Epson', 'Fuji'];

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
  }

  initializeForm() {
    this.createPrinterForm = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
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
      category: [
        '',
        Validators.required,
      ],
      color: [false],
      rentable: [false],
      sellable: [false],
      tags: this.fb.array(['']),
      powerConsumption: [''],
      dimensions: [''],
      printVelocity: [''],
      maxPrintSizeSimple: [''],
      maxPrintSize: [''],
      printSize: [''],
      maxPaperWeight: [0],
      duplexUnit: [false],
      paperSizes: [''],
      applicableOS: [''],
      printerFunctions: [''],
    });
  }


  getPrinter(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.printerService.getPrinter(id).subscribe((printerResponse) => {
        this.printer = printerResponse;
        this.imageUrlsArray = [...this.printer.img_url];
        this.initializeForm();
        console.log(this.printer);
        console.log(this.printer.model);
        this.sharedService.changePrinterModel(printerResponse.model);
      });
    }
  }

  getDealDuration(): number {
    if (this.printer && this.printer.deal) {
      const startDate = new Date(this.printer.deal.dealStartDate);
      const endDate = new Date(this.printer.deal.dealEndDate);
      const diff = endDate.getTime() - startDate.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  getDaysLeft(): number {
    if (this.printer && this.printer.deal) {
      const endDate = new Date(this.printer.deal.dealEndDate);
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  get tagsControls() {
    return (this.createPrinterForm.get('tags') as FormArray).controls;
  }

  addTag() {
    (this.createPrinterForm.get('tags') as FormArray).push(this.fb.control(''));
  }

  removeTag(index: number) {
    const tags = this.createPrinterForm.get('tags') as FormArray;
    if (tags.length > 1) {
      tags.removeAt(index);
    } else {
      tags.at(0).reset('');
    }
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
    const formData = this.createPrinterForm.value;
    formData.price = formData.price.toString();
    if (!formData.datasheet_url) {
      delete formData.datasheet_url;
    }
    this.printerService.submitPrinterCreateForm(formData).subscribe(
      (response: Printer) => {
        this.toastService.showSuccess('Multifuncional creada', 'Cerrar');
        this.router.navigate(['/website/printers', response.id]);
      },
      (error) => {
        this.toastService.showError(error.error.message, 'Cerrar');
      }
    );
  }

  get images(): FormArray {
    return this.createPrinterForm.get('images') as FormArray;
  }


  onFileUploaded(event: any): void {
    const files = event; // The event should be an array of uploaded files
  
    for (const file of files) {
      if (file) {
        const fileExtension = file.split('.').pop();
  
        if (fileExtension === 'pdf') {
          // It's a PDF, so add it to the datasheet_url field
          const datasheetControl = this.createPrinterForm.get('datasheet');
          if (datasheetControl) {
            datasheetControl.setValue(file);
          }
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          // It's an image, so add it to the images field
          this.imageUrlsArray.push(file);
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
      title: 'Borrar imagen de la impresora',
      message: 'Estas seguro de querer eliminar esta imagen?',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar'
      }
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
    this.imageUrlsArray.splice(index, 1);
    this.removeImage(index);
  }

  addImage(): void {
    this.images.push(this.fb.control(''));
  }

  removeImage(index: number): void {
    this.images.removeAt(index);
  }
}
