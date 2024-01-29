import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Printer } from 'src/app/website/interfaces/printer.interface';
import { PrinterService } from '../../services/printer.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ValidatorsService } from 'src/app/shared/services/validators.service';

@Component({
  selector: 'app-printer-edit',
  templateUrl: './printer-edit.component.html',
  styleUrls: ['./printer-edit.component.scss'],
})
export class PrinterEditComponent implements OnInit {
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

  public editPrinterForm!: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private printerService: PrinterService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private validatorsService: ValidatorsService
  ) {}

  ngOnInit(): void {
    this.getPrinter();
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
          : ['']
        ).map((tag) => this.fb.control(tag))
      ),
      powerConsumption: [this.printer ? this.printer.powerConsumption : ''],
      dimensions: [this.printer ? this.printer.dimensions : ''],
      printVelocity: [this.printer ? this.printer.printVelocity : ''],
      maxPrintSizeSimple: [this.printer ? this.printer.maxPrintSizeSimple : ''],
      maxPrintSize: [this.printer ? this.printer.maxPrintSize : ''],
      printSize: [this.printer ? this.printer.printSize : ''],
      maxPaperWeight: [this.printer ? this.printer.maxPaperWeight : ''],
      duplexUnit: [this.printer ? this.printer.duplexUnit : false],
      paperSizes: [this.printer ? this.printer.paperSizes : ''],
      applicableOS: [this.printer ? this.printer.applicableOS : ''],
      printerFunctions: [this.printer ? this.printer.printerFunctions : ''],
    });
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

  getPrinter(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.printerService.getPrinter(id).subscribe((printerResponse) => {
        this.printer = printerResponse;
        this.initializeForm();
        // console.log(this.printer);
        console.log(this.editPrinterForm);
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
    return (this.editPrinterForm.get('tags') as FormArray).controls;
  }

  addTag() {
    (this.editPrinterForm.get('tags') as FormArray).push(this.fb.control(''));
  }

  removeTag(index: number) {
    const tags = this.editPrinterForm.get('tags') as FormArray;
    if (tags.length > 1) {
      tags.removeAt(index);
    } else {
      tags.at(0).reset('');
    }
  }

  onColorChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.editPrinterForm.get('color')?.setValue(target.checked);
  }

  onRentableChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.editPrinterForm.get('rentable')?.setValue(target.checked);
  }

  onSellableChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.editPrinterForm.get('sellable')?.setValue(target.checked);
  }

  onDuplexUnitChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.editPrinterForm.get('duplexUnit')?.setValue(target.checked);
  }

  logFormData() {
    console.log(this.editPrinterForm.value);
  }

  isValidField(field: string): boolean | null {
    // console.log(this.validatorsService.isValidField(this.editPrinterForm, field))
    return this.validatorsService.isValidField(this.editPrinterForm, field);
  }

  getFieldError(field: string): string | null {
    if (!this.editPrinterForm.controls[field]) return null;

    const errors = this.editPrinterForm.controls[field].errors || {};

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
    if (this.editPrinterForm.invalid) {
      console.log('Invalid form');
      console.log(this.editPrinterForm);
      this.editPrinterForm.markAllAsTouched();
      return;
    }
    const formData = this.editPrinterForm.value;
    formData.price = formData.price.toString();
    const printerId = this.route.snapshot.paramMap.get('id');
    if (printerId === null) {
      console.error('Printer id is null');
      return;
    }
    this.printerService.submitPrinterEditForm(formData, printerId).subscribe(
      (response) => {
        this.toastService.showSuccess('Multifuncional editada', 'Aceptar');
        this.router.navigate(['/website/printers', printerId]);
      },
      (error) => {
        this.toastService.showError(error.error.message, 'Aceptar');
      }
    );
  }
}
