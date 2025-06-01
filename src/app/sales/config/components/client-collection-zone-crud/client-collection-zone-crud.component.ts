import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TableColumn } from '../client-config-table/client-config-table.component';
import { ClientsService } from 'src/app/sales/clients/services/clients.service';
import { CollectionZone } from 'src/app/sales/clients/interfaces/client.interface';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { SimpleInputDialogComponent } from 'src/app/shared/components/dialogs/simple-input-dialog/simple-input-dialog.component';

@Component({
  selector: 'client-collection-zone-crud',
  templateUrl: './client-collection-zone-crud.component.html',
  styleUrl: './client-collection-zone-crud.component.scss'
})
export class ClientCollectionZoneCRUDComponent {
  isLoading = false;
  clientCollectionZoneData: CollectionZone[] = [];
  searchTerm = '';

  // Permission flags
  canCreateClientCollectionZone: boolean = true;
  canReadClientCollectionZone: boolean = true;
  canUpdateClientCollectionZone: boolean = true;
  canDeleteClientCollectionZone: boolean = true;


  displayedColumns: string[] = [
    'isActive',
    'name',
    'description',
    'notes',
    'action',
  ];

  columns: TableColumn[] = [
    {
      name: 'isActive',
      label: 'Estado',
      type: 'select',
      sortable: true,
      formatter: (value: any, row: CollectionZone) => ({
        html: true,
        content: `<div class="status-indicator"><span class="circle-icon ${row.isActive ? 'active-icon' : 'inactive-icon'}"></span>
                  <span class="${row.isActive ? 'active-text' : 'inactive-text'}">${row.isActive ? 'Activo' : 'Inactivo'}</span></div>`,
      }),
      rawValue: (row: CollectionZone) => (row.isActive ? 'Activo' : 'Inactivo'), // Raw value for filtering
      showFilter: true,
    },
    {
      name: 'name',
      label: 'Nombre',
      type: 'input',
      sortable: true,
      rawValue: (row: CollectionZone) => row.name, // Use raw business name for filtering
      showFilter: true,
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'input',
      sortable: false,
      rawValue: (row: CollectionZone) => row.description, // Raw value for filtering
      showFilter: false,
    },
    {
      name: 'notes',
      label: 'Notas',
      type: 'input',
      sortable: false,
      rawValue: (row: CollectionZone) => row.notes, // Raw value for filtering
      showFilter: false,
    },
  ];

  constructor(
    private authService: AuthService,
    private clientsService: ClientsService,
    private toastService: ToastService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.initializePermissions();
    this.loadData();
  }

  /**
   * Initializes brand-related permissions by checking with AuthService.
   */
  initializePermissions(): void {
    this.canUpdateClientCollectionZone = this.authService.hasPermission('canUpdateClientCollectionZone');
    this.canDeleteClientCollectionZone = this.authService.hasPermission('canDeleteClientCollectionZone');
    this.canCreateClientCollectionZone = this.authService.hasPermission('canCreateClientCollectionZone');

    // Conditionally add 'action' column based on permissions
    if (this.canUpdateClientCollectionZone || this.canDeleteClientCollectionZone) {
      if (!this.displayedColumns.includes('action')) {
        this.displayedColumns.push('action');
      }
    } else {
      // Remove 'action' column if no permissions
      this.displayedColumns = this.displayedColumns.filter(
        (col) => col !== 'action',
      );
    }
  }

  loadData(): void {
    this.isLoading = true;
    this.clientsService.getCollectionZones().subscribe(
      (zones) => {
        this.clientCollectionZoneData = zones;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.toastService.showError(
          'Error al cargar las zonas de cobranza',
          'error-snackbar',
        );
      },
    );
  }

  getStatusClass(row: CollectionZone): string {
    return row.isActive ? 'active-icon' : 'inactive-icon';
  }

  openDeleteClientCollectionZoneDialog(zone: CollectionZone): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: '¿Estás seguro de desactivar esta zona de cobranza?',
      message: 'La zona de cobranza será desactivada temporalmente. No podrás asignarla a nuevos clientes hasta que la actives de nuevo.',
      buttonText: {
        ok: 'Desactivar',
        cancel: 'Cancelar',
      },
      buttonIcon: {
        ok: 'block',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.deleteClientCollectionZone(zone);
      }
    });
  }

  /**
   * Opens the add branch office dialog.
   */
  openCreateClientCollectionZoneDialog() {
    const zoneDialogFields = [
      { name: 'name', label: 'Nombre', placeholder: 'Ej: Zona Norte, Zona Centro, Zona Metropolitana, Clientes Gobierno', type: 'text', validators: [Validators.required], errorText: 'El nombre es requerido' },
      { name: 'description', label: 'Descripción', placeholder: '(Opcional)', type: 'textarea', validators: [] },
      { name: 'notes', label: 'Notas', placeholder: 'Notas adicionales', type: 'textarea', validators: [] },
    ];
    if (!this.canCreateClientCollectionZone) {
      // Optional: Show a message or handle unauthorized access
      return;
    }
    this.dialog.open(SimpleInputDialogComponent, {
      data: {
        title: 'Agregar Zona de Cobranza',
        actionLabel: 'Guardar',
        icon: 'add',
        fields: zoneDialogFields,
        initialValues: {}
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.submitCreateClientCollectionZone(result);
      }
    });
  }

  openEditClientCollectionZoneDialog(zone: CollectionZone) {
    const zoneDialogFields = [
      { name: 'name', label: 'Nombre', placeholder: 'Ej: Zona Norte, Zona Centro, Zona Metropolitana, Clientes Gobierno', type: 'text', validators: [Validators.required], errorText: 'El nombre es requerido' },
      { name: 'description', label: 'Descripción', placeholder: 'Opcional', type: 'textarea', validators: [] },
      { name: 'notes', label: 'Notas', placeholder: 'Notas adicionales', type: 'textarea', validators: [] },
      { name: 'isActive', label: 'Activo', type: 'checkbox', validators: [] }
    ];

    if (!this.canUpdateClientCollectionZone) {
      // Optional: Show a message or handle unauthorized access
      return;
    }

    this.dialog.open(SimpleInputDialogComponent, {
      data: {
        title: 'Editar Zona de Cobranza',
        actionLabel: 'Guardar',
        icon: 'edit',
        fields: zoneDialogFields,
        initialValues: zone
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.submitEditClientCollectionZone(zone.id, result);
      }
    });
  }

  deleteClientCollectionZone(zone: CollectionZone): void {
    if (!this.canDeleteClientCollectionZone) {
      // Optional: Show a message or handle unauthorized access
      return;
    }
    if (zone.id) {
      this.clientsService.deleteCollectionZone(zone.id).subscribe(
        () => {
          this.toastService.showSuccess(
            'Zona de cobranza desactivada con éxito',
            'Aceptar',
          );
          this.loadData(); // Recarga los datos después de eliminar
        },
        (error) => {
          this.toastService.showError(
            error.error?.message || 'Error al desactivar zona de cobranza',
            'Cerrar',
          );
        },
      );
    }
  }

  submitCreateClientCollectionZone(data: CollectionZone) {
    this.isLoading = true;
    this.clientsService.createCollectionZone(data).subscribe({
      next: (createdZone) => {
        this.toastService.showSuccess('Zona de cobranza creada con éxito', 'Aceptar');
        this.loadData();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastService.showError(
          error.error?.message || 'Error al crear zona de cobranza',
          'Cerrar'
        );
        this.isLoading = false;
      }
    });
  }

  submitEditClientCollectionZone(id: string, data: CollectionZone) {
    this.isLoading = true;
    this.clientsService.updateCollectionZone(id, data).subscribe({
      next: (updatedZone) => {
        this.toastService.showSuccess('Zona de cobranza actualizada con éxito', 'Aceptar');
        this.loadData();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastService.showError(
          error.error?.message || 'Error al actualizar zona de cobranza',
          'Cerrar'
        );
        this.isLoading = false;
      }
    });
  }
}
