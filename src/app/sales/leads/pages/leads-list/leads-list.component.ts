import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';
import { LeadsService } from '../../services/leads.service';
import { Lead } from 'src/app/sales/interfaces/leads.interface';
import { TableColumn } from 'src/app/shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-leads-list',
  templateUrl: './leads-list.component.html',
  styleUrls: ['./leads-list.component.scss'],
})
export class LeadsListComponent implements OnInit {
  leadData: Lead[] = [];
  isLoading = false;
  searchTerm = '';
  // Define the columns for the data table
  displayedColumns: string[] = [
    'status',
    'client',
    'product_interested',
    'email',
    'last_contacted',
    'assigned',
    'action',
  ];

  columns: TableColumn[] = [
    {
      name: 'status',
      label: 'Estatus',
      sortable: true,
      formatter: (value: any, row: Lead) => ({
        html: true,
        content: `<div class="${this.getStatusClass(
          row,
        )}">${this.translateStatus(row.status)}</div>`,
      }),
    },
    {
      name: 'client',
      label: 'Cliente',
      sortable: true,
    },
    {
      name: 'product_interested',
      label: 'Producto Interesado',
      sortable: true,
      formatter: (value: any, row: Lead) => this.getProductName(row),
    },
    {
      name: 'email',
      label: 'Contacto',
      sortable: true,
      formatter: (value: any, row: Lead) => ({
        html: true,
        content: `${row.email}<br>${
          row.phone ? this.formatPhone(row.phone) : ''
        }`,
      }),
    },
    {
      name: 'last_contacted',
      label: 'Último Contacto',
      sortable: true,
      formatter: (value: any, row: Lead) => ({
        html: true,
        content: `<div class="last-contact-container">
                  <div class="status-icon ${this.getCommunicationClass(
                    row,
                  )}"></div>
                  ${this.getLastCommunicationTime(row)}
                </div>`,
      }),
    },
    {
      name: 'assigned',
      label: 'Asignado',
      formatter: (value: any, row: Lead) => row.assigned?.name || 'No asignado',
    },
  ];
  constructor(
    private leadsService: LeadsService,
    private router: Router,
    private toastService: ToastService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.leadsService.getAllLeads().subscribe(
      (leads) => {
        this.leadData = leads;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.toastService.showError(
          'Error al cargar los leads',
          'error-snackbar',
        );
      },
    );
  }

  translateStatus(status: string): string {
    switch (status) {
      case 'prospect':
        return 'Prospecto';
      case 'client':
        return 'Cliente';
      case 'no-client':
        return 'No Cliente';
      default:
        return status;
    }
  }

  getStatusClass(row: Lead): string {
    if (row.status === 'prospect') {
      return 'prospect-class';
    } else if (row.status === 'client') {
      return 'client-class';
    } else if (row.status === 'no-client') {
      return 'no-client-class';
    } else {
      return '';
    }
  }

  getProductName(row: Lead): string {
    return row.product_interested || 'No especificado';
  }

  formatPhone(phone: string): string {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }

  getLastCommunicationTime(row: Lead): string {
    if (row.communications && row.communications.length > 0) {
      const sorted = row.communications.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      const lastDate = new Date(sorted[0].date);
      const diffInMilliseconds = Date.now() - lastDate.getTime();
      const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return 'Menos de una hora';
      } else if (diffInHours < 24) {
        return Math.floor(diffInHours) === 1
          ? '1 hora'
          : `${Math.floor(diffInHours)} horas`;
      } else {
        const diffInDays = diffInHours / 24;
        return Math.floor(diffInDays) === 1
          ? '1 día'
          : `${Math.floor(diffInDays)} días`;
      }
    }
    return 'Sin comunicaciones';
  }

  getCommunicationClass(row: Lead): string {
    if (row.communications && row.communications.length > 0) {
      const sorted = row.communications.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      const lastDate = new Date(sorted[0].date);
      const diffInMilliseconds = Date.now() - lastDate.getTime();
      const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);

      if (diffInDays <= 1) {
        return 'within-one-days'; // Green
      } else if (diffInDays <= 3) {
        return 'within-three-days'; // Light Green
      } else if (diffInDays <= 5) {
        return 'within-five-days'; // Yellow
      } else if (diffInDays <= 7) {
        return 'within-seven-days'; // Orange
      } else {
        return 'more-than-seven-days'; // Red
      }
    }
    return 'no-communications';
  }

  seeLead(lead: Lead): void {
    this.router.navigate([`sales/leads/${lead.id}`]);
  }

  editLead(lead: Lead): void {
    this.router.navigate([`sales/leads/${lead.id}/edit`]);
  }

  openConfirmDialog(lead: Lead): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Estas seguro de eliminar este cliente potencial?',
      message: 'El cliente potencial será eliminado permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (lead.id) {
          this.deleteLead(lead);
        }
      }
    });
  }

  // Keep this method
  onRowClick(row: Lead): void {
    this.router.navigate([`sales/leads/${row.id}`]);
  }

  // Re-implement your original delete method if not already present
  deleteLead(lead: Lead): void {
    if (lead.id) {
      this.leadsService.deleteLead(String(lead.id)).subscribe(
        (response) => {
          // Update leadData
          this.leadData = this.leadData.filter((p) => p.id !== lead.id);
          this.toastService.showSuccess(
            'Cliente potencial eliminado con éxito',
            'Aceptar',
          );
        },
        (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
        },
      );
    }
  }

  addLead(): void {
    this.router.navigate(['sales/leads/create']);
  }
}
