import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ClientsService } from '../../services/clients.service';
import { Client } from '../../interfaces/client.interface';
import { TableColumn } from 'src/app/shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss'],
})
export class ClientsListComponent implements OnInit {
  clientData: Client[] = [];
  isLoading = false;
  searchTerm = '';

  // Define columns for the data table
  displayedColumns: string[] = [
    'status',
    'businessName',
    'rfc',
    'address',
    'contact',
    'action',
  ];

  columns: TableColumn[] = [
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      sortable: true,
      formatter: (value: any, row: Client) => ({
        html: true,
        content: `<div class="${this.getStatusClass(row)}">${row.isActive ? 'Activo' : 'Inactivo'}</div>`,
      }),
      rawValue: (row: Client) => (row.isActive ? 'Activo' : 'Inactivo'), // Raw value for filtering
      showFilter: true,
    },
    {
      name: 'businessName',
      label: 'Cliente',
      type: 'input',
      sortable: true,
      formatter: (value: any, row: Client) => ({
        html: true,
        content: `<div>
                  <strong>${row.businessName}</strong>
                  ${row.commercialName ? '<br>' + row.commercialName : ''}
                </div>`,
      }),
      rawValue: (row: Client) => row.businessName, // Use raw business name for filtering
      showFilter: true,
    },
    {
      name: 'rfc',
      label: 'RFC',
      type: 'input',
      sortable: true,
      rawValue: (row: Client) => row.rfc, // Raw value for filtering
      showFilter: true,
    },
    {
      name: 'address',
      label: 'Dirección',
      type: 'input',
      sortable: false,
      formatter: (value: any, row: Client) => ({
        html: true,
        content: this.formatAddress(row),
      }),
      rawValue: (row: Client) => this.formatAddress(row), // Use formatted address for filtering
      showFilter: false,
    },
    {
      name: 'contact',
      label: 'Contacto',
      type: 'select',
      sortable: false,
      formatter: (value: any, row: Client) => ({
        html: true,
        content: this.getMainContactInfo(row),
      }),
      rawValue: (row: Client) => this.getMainContactInfo(row), // Use contact info for filtering
      showFilter: false,
    },
  ];

  constructor(
    private clientsService: ClientsService,
    private router: Router,
    private toastService: ToastService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.clientsService.getAllClients().subscribe(
      (clients) => {
        this.clientData = clients;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.toastService.showError(
          'Error al cargar los clientes',
          'error-snackbar',
        );
      },
    );
  }

  getStatusClass(row: Client): string {
    return row.isActive ? 'active-client' : 'inactive-client';
  }

  formatAddress(client: Client): string {
    const addressParts = [
      client.street,
      client.exteriorNumber,
      client.interiorNumber ? `Int. ${client.interiorNumber}` : '',
      client.neighborhood,
      client.municipality,
      client.state,
      client.postalCode,
    ].filter(Boolean); // Filter out empty values

    return addressParts.join(', ');
  }

  getMainContactInfo(client: Client): string {
    if (!client.contacts || client.contacts.length === 0) {
      return 'No hay contactos registrados';
    }

    // Try to find default contact first
    const mainContact =
      client.contacts.find((contact) => contact.isDefault) ||
      client.contacts[0];

    const contactParts = [
      mainContact.name,
      mainContact.email ? `<br>${mainContact.email}` : '',
      mainContact.mobilePhone
        ? `<br>${this.formatPhone(mainContact.mobilePhone)}`
        : '',
    ].filter(Boolean);

    return contactParts.join('');
  }

  formatPhone(phone: string): string {
    if (!phone) return '';
    // Simple formatting for numeric phone numbers
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }

  seeClient(client: Client): void {
    this.router.navigate([`clients/${client.id}`]);
  }

  editClient(client: Client): void {
    this.router.navigate([`clients/${client.id}/edit`]);
  }

  openConfirmDialog(client: Client): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: '¿Estás seguro de eliminar este cliente?',
      message: 'El cliente será eliminado permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.deleteClient(client);
      }
    });
  }

  onRowClick(row: Client): void {
    this.router.navigate([`clients/${row.id}`]);
  }

  deleteClient(client: Client): void {
    if (client.id) {
      this.clientsService.deleteClient(client.id).subscribe(
        () => {
          this.clientData = this.clientData.filter((c) => c.id !== client.id);
          this.toastService.showSuccess(
            'Cliente eliminado con éxito',
            'Aceptar',
          );
        },
        (error) => {
          this.toastService.showError(
            error.error?.message || 'Error al eliminar cliente',
            'Cerrar',
          );
        },
      );
    }
  }

  addClient(): void {
    this.router.navigate(['clients/create']);
  }
}
