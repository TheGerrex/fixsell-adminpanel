import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { environment } from 'src/environments/environments';
import { ToastService } from '../../services/toast.service';
import { Printer } from 'src/app/website/interfaces/printer.interface';

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

  @Input() rootFolder: string = '';
  @Input() printer?: Printer;

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
        this.uploadFile(files[0], this.rootFolder, this.printer?.brand || '', this.printer?.model || '');
      }
    }
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file: File | null = fileInput.files?.[0] || null;

    if (file) {
      this.uploadFile(file, this.rootFolder, this.printer?.brand || '', this.printer?.model || '');
    }
  }

  uploadFile(file: File, rootFolder: string, brand: string, model: string) {
    this.isUploading = true; // Set isUploading to true when upload starts
  
    console.log('Uploading file:', file.name);
  
    const formData = new FormData();
    formData.append('image', file, file.name);
    formData.append('rootFolder', rootFolder);
    formData.append('subRootfolder', brand);
    formData.append('childFolder', model);
  
    this.http.post(`${environment.baseUrl}/upload/image`, formData).subscribe(
      (res: any) => {
        this.isUploading = false; // Set isUploading to false when upload completes
        console.log(res.url);
        this.fileUpload.emit(res.url); // Emit file upload event with response body
        this.toastService.showSuccess('Imagen agregada con exito', 'Aceptar');
      },
      (err) => {
        this.isUploading = false; // Set isUploading to false if an error occurs
        this.toastService.showError(err.error.message, 'Aceptar');
        console.error(err);
      }
    );
  }
}
