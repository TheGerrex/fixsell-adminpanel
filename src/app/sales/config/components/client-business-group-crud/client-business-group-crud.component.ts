import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TableColumn } from '../client-config-table/client-config-table.component';
import { ClientsService } from 'src/app/sales/clients/services/clients.service';
import { BusinessGroup } from 'src/app/sales/clients/interfaces/client.interface';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { SimpleInputDialogComponent } from 'src/app/shared/components/dialogs/simple-input-dialog/simple-input-dialog.component';

@Component({
  selector: 'client-business-group-crud',
  templateUrl: './client-business-group-crud.component.html',
  styleUrl: './client-business-group-crud.component.scss'
})
export class ClientBusinessGroupCRUDComponent {
  isLoading = false;
  clientBusinessGroupData: BusinessGroup[] = [];
  searchTerm = '';

  // Permission flags
  canCreateClientBusinessGroup: boolean = true;
  canReadClientBusinessGroup: boolean = true;
  canUpdateClientBusinessGroup: boolean = true;
  canDeleteClientBusinessGroup: boolean = true;


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
      formatter: (value: any, row: BusinessGroup) => ({
        html: true,
        content: `<div class="status-indicator"><span class="circle-icon ${row.isActive ? 'active-icon' : 'inactive-icon'}"></span>
                  <span class="${row.isActive ? 'active-text' : 'inactive-text'}">${row.isActive ? 'Activo' : 'Inactivo'}</span></div>`,
      }),
      rawValue: (row: BusinessGroup) => (row.isActive ? 'Activo' : 'Inactivo'), // Raw value for filtering
      showFilter: true,
    },
    {
      name: 'name',
      label: 'Nombre',
      type: 'input',
      sortable: true,
      rawValue: (row: BusinessGroup) => row.name, // Use raw business name for filtering
      showFilter: true,
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'input',
      sortable: false,
      rawValue: (row: BusinessGroup) => row.description, // Raw value for filtering
      showFilter: false,
    },
    {
      name: 'notes',
      label: 'Notas',
      type: 'input',
      sortable: false,
      rawValue: (row: BusinessGroup) => row.notes, // Raw value for filtering
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
    this.canUpdateClientBusinessGroup = this.authService.hasPermission('canUpdateClientBusinessGroup');
    this.canDeleteClientBusinessGroup = this.authService.hasPermission('canDeleteClientBusinessGroup');
    this.canCreateClientBusinessGroup = this.authService.hasPermission('canCreateClientBusinessGroup');

    // Conditionally add 'action' column based on permissions
    if (this.canUpdateClientBusinessGroup || this.canDeleteClientBusinessGroup) {
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
    this.clientsService.getBusinessGroups().subscribe(
      (groups) => {
        this.clientBusinessGroupData = groups;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.toastService.showError(
          'Error al cargar los grupos de trabajo',
          'error-snackbar',
        );
      },
    );
  }

  getStatusClass(row: BusinessGroup): string {
    return row.isActive ? 'active-icon' : 'inactive-icon';
  }

  openDeleteClientBusinessGroupDialog(group: BusinessGroup): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: '¿Estás seguro de desactivar este grupo de trabajo?',
      message: 'El grupo de trabajo será desactivado temporalmente. No podrás asignarlo a nuevos clientes hasta que lo actives de nuevo.',
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
        this.deleteClientBusinessGroup(group);
      }
    });
  }

  /**
   * Opens the add branch office dialog.
   */
  openCreateClientBusinessGroupDialog() {
    const groupDialogFields = [
      { name: 'name', label: 'Nombre', placeholder: 'Ej: Sector Público, Sector Privado, ONG', type: 'text', validators: [Validators.required], errorText: 'El nombre es requerido' },
      { name: 'description', label: 'Descripción', placeholder: '(Opcional)', type: 'textarea', validators: [] },
      { name: 'notes', label: 'Notas', placeholder: 'Notas adicionales', type: 'textarea', validators: [] },
    ];
    if (!this.canCreateClientBusinessGroup) {
      // Optional: Show a message or handle unauthorized access
      return;
    }
    this.dialog.open(SimpleInputDialogComponent, {
      data: {
        title: 'Agregar Grupo de Trabajo',
        actionLabel: 'Guardar',
        icon: 'add',
        fields: groupDialogFields,
        initialValues: {}
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.submitCreateClientBusinessGroup(result);
      }
    });
  }

  openEditClientBusinessGroupDialog(group: BusinessGroup) {
    const groupDialogFields = [
      { name: 'name', label: 'Nombre', placeholder: 'Ej: Sucursal Centro', type: 'text', validators: [Validators.required], errorText: 'El nombre es requerido' },
      { name: 'description', label: 'Descripción', placeholder: 'Opcional', type: 'textarea', validators: [] },
      { name: 'notes', label: 'Notas', placeholder: 'Notas adicionales', type: 'textarea', validators: [] },
      { name: 'isActive', label: 'Activo', type: 'checkbox', validators: [] }
    ];

    if (!this.canUpdateClientBusinessGroup) {
      // Optional: Show a message or handle unauthorized access
      return;
    }

    this.dialog.open(SimpleInputDialogComponent, {
      data: {
        title: 'Editar Grupo de Trabajo',
        actionLabel: 'Guardar',
        icon: 'edit',
        fields: groupDialogFields,
        initialValues: group
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.submitEditClientBusinessGroup(group.id, result);
      }
    });
  }

  deleteClientBusinessGroup(group: BusinessGroup): void {
    if (!this.canDeleteClientBusinessGroup) {
      // Optional: Show a message or handle unauthorized access
      return;
    }
    if (group.id) {
      this.clientsService.deleteBusinessGroup(group.id).subscribe(
        () => {
          this.toastService.showSuccess(
            'Grupo de trabajo desactivado con éxito',
            'Aceptar',
          );
          this.loadData(); // Recarga los datos después de eliminar
        },
        (error) => {
          this.toastService.showError(
            error.error?.message || 'Error al desactivar grupo de trabajo',
            'Cerrar',
          );
        },
      );
    }
  }

  submitCreateClientBusinessGroup(data: BusinessGroup) {
    this.isLoading = true;
    this.clientsService.createBusinessGroup(data).subscribe({
      next: (createdGroup) => {
        this.toastService.showSuccess('Grupo de trabajo creado con éxito', 'Aceptar');
        this.loadData();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastService.showError(
          error.error?.message || 'Error al crear grupo de trabajo',
          'Cerrar'
        );
        this.isLoading = false;
      }
    });
  }

  submitEditClientBusinessGroup(id: string, data: BusinessGroup) {
    this.isLoading = true;
    this.clientsService.updateBusinessGroup(id, data).subscribe({
      next: (updatedGroup) => {
        this.toastService.showSuccess('Grupo de trabajo actualizado con éxito', 'Aceptar');
        this.loadData();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastService.showError(
          error.error?.message || 'Error al actualizar grupo de trabajo',
          'Cerrar'
        );
        this.isLoading = false;
      }
    });
  }
}


