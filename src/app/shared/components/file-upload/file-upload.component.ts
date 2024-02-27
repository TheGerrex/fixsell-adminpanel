import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ToastService } from '../../services/toast.service';
import { Printer } from 'src/app/website/interfaces/printer.interface';
import { Consumible } from 'src/app/website/interfaces/consumibles.interface';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent {
  isUploading = false;
  isDragging = false; // Add this line

  // event emitter for file upload
  @Output() fileUpload = new EventEmitter<any>();

  @Input() productFolder: string = '';
  @Input() typeFolder: string = '';
  @Input() printer?: Printer;
  @Input() consumible?: Consumible;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  onDragOver(event: Event) {
    event.preventDefault();
    this.isDragging = true; // Set isDragging to true when dragover event occurs
  }

  onDragLeave(event: Event) {
    event.preventDefault();
    this.isDragging = false; // Set isDragging to false when dragleave event occurs
  }

  onDrop(event: DragEvent) {
  event.preventDefault();
  this.isDragging = false; // Set isDragging to false when drop event occurs

  if (event.dataTransfer) {
    const files = event.dataTransfer.files;

    if (files.length) {
      if (this.printer) {
        this.uploadFiles(
          files,
          this.productFolder,
          this.typeFolder,
          this.printer?.brand || '',
          this.printer?.model || ''
        );
      } else if (this.consumible) {
        this.uploadFiles(
          files,
          this.productFolder,
          this.typeFolder,
          this.consumible?.brand || '',
          this.consumible?.name || ''
        );
      } else {
        // Upload files to a temporary folder if printer or consumible is not yet available
        console.log('Uploading to temporary folder');
        this.uploadFiles(
          files,
          this.productFolder,
          this.typeFolder,
          '',
          ''
        );
      }
    }
  }
}

onFileSelected(event: Event) {
  const fileInput = event.target as HTMLInputElement;
  const files: FileList | null = fileInput.files || null;

  if (files && files.length) {
    if (this.printer) {
      this.uploadFiles(
        files,
        this.productFolder,
        this.typeFolder,
        this.printer?.brand || '',
        this.printer?.model || ''
      );
    } else if (this.consumible) {
      this.uploadFiles(
        files,
        this.productFolder,
        this.typeFolder,
        this.consumible?.brand || '',
        this.consumible?.name || ''
      );
    } else {
      // Upload files to a temporary folder if printer or consumible is not yet available
      console.log('Uploading to temporary folder');
      this.uploadFiles(
        files,
        this.productFolder,
        this.typeFolder,
        '',
        ''
      );
    }
  }
}

  uploadFiles(
    files: FileList,
    productFolder: string,
    typeFolder: string,
    brandFolder: string,
    modelFolder: string
  ) {
    this.isUploading = true; // Set isUploading to true when upload starts

    console.log(files);
    console.log(productFolder);
    console.log(typeFolder);
    console.log(brandFolder);
    console.log(modelFolder);

    const formData = new FormData();
    formData.append('productFolder', productFolder);
    formData.append('typeFolder', typeFolder);
    formData.append('brandFolder', brandFolder);
    formData.append('modelFolder', modelFolder);

    for (let i = 0; i < files.length; i++) {
      formData.append('image', files[i], files[i].name);
    }

    this.http
      .post(`${environment.baseUrl}/upload/image/multiple`, formData)
      .subscribe(
        (res: any) => {
          this.isUploading = false; // Set isUploading to false when upload completes
          this.fileUpload.emit(res.urls); // Emit file upload event with response body
          this.toastService.showSuccess(
            'Archivos agregados con exito',
            'Aceptar'
          );
        },
        (err) => {
          this.isUploading = false; // Set isUploading to false if an error occurs
          this.toastService.showError(err.error.message, 'Aceptar');
          console.error(err);
        }
      );
  }
}
