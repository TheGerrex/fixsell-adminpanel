import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';
import { EventData } from '../../../interfaces/event.interface';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-edit-dialog',
  templateUrl: './event-edit-dialog.component.html',
  styleUrls: ['./event-edit-dialog.component.scss'],
})
export class EventEditDialogComponent implements OnInit {
  eventForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private toastService: ToastService,
    private dialogRef: MatDialogRef<EventEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
  ) {}

  ngOnInit(): void {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', Validators.required],
      image: [null, Validators.required], // Single image
    });

    // Load existing event data
    this.loadEventData();
  }

  /**
   * Fetches the existing event data and populates the form.
   */
  loadEventData(): void {
    const eventId = this.data.id;
    this.eventService.findOne(eventId).subscribe(
      (event: EventData) => {
        this.eventForm.patchValue({
          title: event.title,
          startDate: event.startDate,
          endDate: event.endDate,
          description: event.description,
          image: event.image, // Assuming 'image' holds the image URL
        });
      },
      (error) => {
        console.error('Error fetching event data:', error);
        this.toastService.showError(
          'Error al cargar los datos del evento',
          'Cerrar',
        );
        this.dialogRef.close();
      },
    );
  }

  /**
   * Handles the image upload event.
   * @param event The uploaded image URL or File.
   */
  onFileUploaded(event: any): void {
    const file = Array.isArray(event) ? event[0] : event; // Expecting a single file
    if (file) {
      // If 'file' is a File object, convert it to a URL for preview
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onload = () => {
          this.eventForm.patchValue({ image: reader.result as string });
        };
        reader.readAsDataURL(file);
      } else {
        // If 'file' is already a URL
        this.eventForm.patchValue({ image: file });
      }
    }
  }

  /**
   * Removes the uploaded image from the form.
   */
  onRemoveImage(): void {
    this.eventForm.patchValue({ image: null });
  }

  /**
   * Submits the form to update the event.
   */
  onSubmit(): void {
    if (this.eventForm.valid) {
      this.isSubmitting = true;

      const formValue = {
        ...this.eventForm.value,
        startDate: new Date(this.eventForm.value.startDate),
        endDate: new Date(this.eventForm.value.endDate),
      };

      this.eventService.update(this.data.id, formValue).subscribe(
        (updatedEvent: EventData) => {
          this.isSubmitting = false;
          this.toastService.showSuccess(
            'Evento actualizado con éxito',
            'Cerrar',
          );
          this.dialogRef.close(updatedEvent);
        },
        (error) => {
          console.error('Error updating event:', error);
          this.isSubmitting = false;
          this.toastService.showError('Error actualizando el evento', 'Cerrar');
        },
      );
    } else {
      this.eventForm.markAllAsTouched();
    }
  }

  /**
   * Cancels the editing of the event and closes the dialog.
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Checks if a form field is valid.
   * @param field The name of the form control.
   * @returns True if the field is invalid and has been touched or dirty.
   */
  isValidField(field: string): boolean {
    const control = this.eventForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Retrieves the error message for a specific form field.
   * @param field The name of the form control.
   * @returns The error message string.
   */
  getFieldError(field: string): string {
    const controlErrors = this.eventForm.get(field)?.errors;
    if (controlErrors?.['required']) {
      return 'Este campo es requerido';
    }
    return '';
  }
}
