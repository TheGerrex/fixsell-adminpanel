import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LeadsService } from '../../services/leads.service';
import { Communication } from 'src/app/sales/interfaces/leads.interface';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-communication-detail',
  templateUrl: './communication-detail.component.html',
  styleUrls: ['./communication-detail.component.scss'],
})
export class CommunicationDetailComponent implements OnInit {
  communication: Communication | null = null;
  isLoadingData = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leadsService: LeadsService,
    private dialog: MatDialog,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.leadsService.getCommunicationById(id).subscribe(
      (communication) => {
        this.communication = communication;
      },
      (error) => {
        console.error('Error fetching communication:', error);
      }
    );
  }

  editComunication(communication: Communication) {
    // code to edit the communication with the given id
    console.log(communication);
    console.log(communication.id);
    console.log(
      'navigating to: ',
      `sales/leads/communication/${communication.id}/edit`
    );
    this.router.navigate([
      `sales/leads/communication/${communication.id}/edit`,
    ]);
  }

  openConfirmDialogComunication(communication: Communication): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Estas seguro de eliminar esta comunicación?',
      message: 'La comunicación será eliminada permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (communication.id) {
          this.deleteCommunication(communication);
        }
      }
    });
  }

  deleteCommunication(communication: Communication) {
    if (communication.id) {
      this.leadsService.deleteCommunication(String(communication.id)).subscribe(
        (response) => {
          this.router.navigate([
            `sales/leads/${communication.lead.id}`,
          ]);
          this.toastService.showSuccess(
            'Comunicación eliminada con éxito',
            'Aceptar'
          );
        },
        (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
        }
      );
    }
  }
}
