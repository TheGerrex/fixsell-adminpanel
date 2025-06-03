import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TableColumn } from '../client-config-table/client-config-table.component';
import { ClientsService } from 'src/app/sales/clients/services/clients.service';
import { BusinessLine } from 'src/app/sales/clients/interfaces/client.interface';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { SimpleInputDialogComponent } from 'src/app/shared/components/dialogs/simple-input-dialog/simple-input-dialog.component';

@Component({
  selector: 'client-business-line-crud',
  templateUrl: './client-business-line-crud.component.html',
  styleUrl: './client-business-line-crud.component.scss'
})
export class ClientBusinessLineCRUDComponent {
  isLoading = false;
  clientBusinessLineData: BusinessLine[] = [];
  searchTerm = '';

  // Permission flags
  canCreateClientBusinessLine: boolean = true;
  canReadClientBusinessLine: boolean = true;
  canUpdateClientBusinessLine: boolean = true;
  canDeleteClientBusinessLine: boolean = true;


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
      formatter: (value: any, row: BusinessLine) => ({
        html: true,
        content: `<div class="status-indicator"><span class="circle-icon ${row.isActive ? 'active-icon' : 'inactive-icon'}"></span>
                  <span class="${row.isActive ? 'active-text' : 'inactive-text'}">${row.isActive ? 'Activo' : 'Inactivo'}</span></div>`,
      }),
      rawValue: (row: BusinessLine) => (row.isActive ? 'Activo' : 'Inactivo'), // Raw value for filtering
      showFilter: true,
    },
    {
      name: 'name',
      label: 'Nombre',
      type: 'input',
      sortable: true,
      rawValue: (row: BusinessLine) => row.name, // Use raw business name for filtering
      showFilter: true,
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'input',
      sortable: false,
      rawValue: (row: BusinessLine) => row.description, // Raw value for filtering
      showFilter: false,
    },
    {
      name: 'notes',
      label: 'Notas',
      type: 'input',
      sortable: false,
      rawValue: (row: BusinessLine) => row.notes, // Raw value for filtering
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
    this.canUpdateClientBusinessLine = this.authService.hasPermission('canUpdateClientBusinessLine');
    this.canDeleteClientBusinessLine = this.authService.hasPermission('canDeleteClientBusinessLine');
    this.canCreateClientBusinessLine = this.authService.hasPermission('canCreateClientBusinessLine');

    // Conditionally add 'action' column based on permissions
    if (this.canUpdateClientBusinessLine || this.canDeleteClientBusinessLine) {
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
    this.clientsService.getBusinessLines().subscribe(
      (lines) => {
        this.clientBusinessLineData = lines;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.toastService.showError(
          'Error al cargar las líneas de negocio',
          'error-snackbar',
        );
      },
    );
  }

  getStatusClass(row: BusinessLine): string {
    return row.isActive ? 'active-icon' : 'inactive-icon';
  }

  openDeleteClientBusinessLineDialog(line: BusinessLine): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: '¿Estás seguro de desactivar esta línea de negocio?',
      message: 'La línea de negocio será desactivada temporalmente. No podrás asignarla a nuevos clientes hasta que la actives de nuevo.',
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
        this.deleteClientBusinessLine(line);
      }
    });
  }

  /**
   * Opens the add branch office dialog.
   */
  openCreateClientBusinessLineDialog() {
    const lineDialogFields = [
      { name: 'name', label: 'Nombre', placeholder: 'Ej: Servicios de Mantenimiento, Soluciones Documentales, Venta Directa, Contratos de Renta', type: 'text', validators: [Validators.required], errorText: 'El nombre es requerido' },
      { name: 'description', label: 'Descripción', placeholder: '(Opcional)', type: 'textarea', validators: [] },
      { name: 'notes', label: 'Notas', placeholder: 'Notas adicionales', type: 'textarea', validators: [] },
    ];
    if (!this.canCreateClientBusinessLine) {
      // Optional: Show a message or handle unauthorized access
      return;
    }
    this.dialog.open(SimpleInputDialogComponent, {
      data: {
        title: 'Agregar Línea de Negocio',
        actionLabel: 'Guardar',
        icon: 'add',
        fields: lineDialogFields,
        initialValues: {}
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.submitCreateClientBusinessLine(result);
      }
    });
  }

  openEditClientBusinessLineDialog(line: BusinessLine) {
    const lineDialogFields = [
      { name: 'name', label: 'Nombre', placeholder: 'Ej: Servicios de Mantenimiento, Soluciones Documentales, Venta Directa, Contratos de Renta', type: 'text', validators: [Validators.required], errorText: 'El nombre es requerido' },
      { name: 'description', label: 'Descripción', placeholder: '(Opcional)', type: 'textarea', validators: [] },
      { name: 'notes', label: 'Notas', placeholder: 'Notas adicionales', type: 'textarea', validators: [] },
      { name: 'isActive', label: 'Activo', type: 'checkbox', validators: [] }
    ];

    if (!this.canUpdateClientBusinessLine) {
      // Optional: Show a message or handle unauthorized access
      return;
    }

    this.dialog.open(SimpleInputDialogComponent, {
      data: {
        title: 'Editar Línea de Negocio',
        actionLabel: 'Guardar',
        icon: 'edit',
        fields: lineDialogFields,
        initialValues: line
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.submitEditClientBusinessLine(line.id, result);
      }
    });
  }

  deleteClientBusinessLine(line: BusinessLine): void {
    if (!this.canDeleteClientBusinessLine) {
      // Optional: Show a message or handle unauthorized access
      return;
    }
    if (line.id) {
      this.clientsService.deleteBusinessLine(line.id).subscribe(
        () => {
          this.toastService.showSuccess(
            'Línea de negocio desactivada con éxito',
            'Aceptar',
          );
          this.loadData(); // Recarga los datos después de eliminar
        },
        (error) => {
          this.toastService.showError(
            error.error?.message || 'Error al desactivar línea de negocio',
            'Cerrar',
          );
        },
      );
    }
  }

  submitCreateClientBusinessLine(data: BusinessLine) {
    this.isLoading = true;
    this.clientsService.createBusinessLine(data).subscribe({
      next: (createdLine) => {
        this.toastService.showSuccess('Línea de negocio creada con éxito', 'Aceptar');
        this.loadData();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastService.showError(
          error.error?.message || 'Error al crear línea de negocio',
          'Cerrar'
        );
        this.isLoading = false;
      }
    });
  }

  submitEditClientBusinessLine(id: string, data: BusinessLine) {
    this.isLoading = true;
    this.clientsService.updateBusinessLine(id, data).subscribe({
      next: (updatedLine) => {
        this.toastService.showSuccess('Línea de negocio actualizada con éxito', 'Aceptar');
        this.loadData();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastService.showError(
          error.error?.message || 'Error al actualizar línea de negocio',
          'Cerrar'
        );
        this.isLoading = false;
      }
    });
  }
}