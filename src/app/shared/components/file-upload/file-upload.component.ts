import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { environment } from 'src/environments/environments';

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

  constructor(private http: HttpClient) {}

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
        this.uploadFile(files[0]);
      }
    }
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file: File | null = fileInput.files?.[0] || null;

    if (file) {
      this.uploadFile(file);
    }
  }

  uploadFile(file: File) {
    this.isUploading = true; // Set isUploading to true when upload starts

    console.log('Uploading file:', file.name);

    const formData = new FormData();
    formData.append('image', file, file.name);

    this.http.post(`${environment.baseUrl}/upload/image`, formData).subscribe(
      (res: any) => {
        this.isUploading = false; // Set isUploading to false when upload completes
        console.log(res.url);
        this.fileUpload.emit(res.url); // Emit file upload event with response body
      },
      (err) => {
        this.isUploading = false; // Set isUploading to false if an error occurs
        console.error(err);
      }
    );
  }
}
