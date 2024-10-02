import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Lead, Communication } from 'src/app/sales/interfaces/leads.interface';
import { LeadsService } from '../../services/leads.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidatorsService } from 'src/app/shared/services/validators.service';
@Component({
  selector: 'app-communication-edit',
  templateUrl: './communication-edit.component.html',
  styleUrls: ['./communication-edit.component.scss'],
})
export class CommunicationEditComponent implements OnInit {
  public editCommunicationForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  lead: Lead | null = null;
  communication: Communication | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private leadsService: LeadsService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private validatorsService: ValidatorsService,
  ) {
    this.editCommunicationForm = this.fb.group({
      client: new FormControl(
        { value: '', disabled: true },
        Validators.required,
      ),
      message: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      notes: new FormControl(''),
      lead: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    this.isLoading = true;
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.leadsService.getCommunicationById(id).subscribe((communication) => {
        this.communication = communication;

        this.populateForm(communication);
      });
    });
    this.initializeForm();
    this.isLoading = false;
  }

  populateForm(communication: Communication): void {
    this.editCommunicationForm.patchValue({
      client: communication.lead.client,
      message: communication.message,
      date: communication.date,
      type: communication.type,
      notes: communication.notes,
    });
  }

  initializeForm(): void {
    const communicationId = this.route.snapshot.paramMap.get('id');
    console.log(communicationId);

    this.leadsService.getCommunicationById(communicationId ?? '').subscribe(
      (communication: Communication) => {
        this.communication = communication;
        console.log(communication);
        this.editCommunicationForm = this.fb.group({
          client: new FormControl(
            { value: this.communication?.lead.client, disabled: true },
            Validators.required,
          ),
          message: new FormControl(
            this.communication?.message,
            Validators.required,
          ),
          date: new FormControl(this.communication?.date, Validators.required),
          type: new FormControl(this.communication?.type, Validators.required),
          notes: new FormControl(this.communication?.notes),
          lead: new FormControl(this.communication?.lead, Validators.required),
        });
      },
      (error: any) => {
        console.error('Error fetching communication:', error);
      },
    );
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(
      this.editCommunicationForm,
      field,
    );
  }

  getFieldError(field: string): string | null {
    return this.validatorsService.getFieldError(
      this.editCommunicationForm,
      field,
    );
  }

  async submitForm() {
    this.isSubmitting = true;

    console.log('Form submitted:', this.editCommunicationForm.value);

    let communicationData = {
      ...this.editCommunicationForm.value,
    };
    delete communicationData.lead; // remove the 'lead' property

    console.log('Form prepared:', communicationData);

    //get communication id
    let id = this.route.snapshot.paramMap.get('id');

    this.leadsService.updateSalesCommunication(communicationData, id).subscribe(
      (response: any) => {
        console.log('Communication updated:', response);
        this.toastService.showSuccess(
          'Comunicación actualizada con éxito',
          'success-snackbar',
        );
        this.router.navigate(['/sales/leads/', this.communication?.lead.id]);
      },
      (error: any) => {
        console.error('Error updating communication:', error);
        this.toastService.showError(
          'Error actualizando la comunicación',
          'error-snackbar',
        );
      },
    );
  }
}
