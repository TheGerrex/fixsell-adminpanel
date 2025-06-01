import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TableColumn } from '../client-config-table/client-config-table.component';
import { ClientsService } from 'src/app/sales/clients/services/clients.service';
import { ClientCategory } from 'src/app/sales/clients/interfaces/client.interface';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { SimpleInputDialogComponent } from 'src/app/shared/components/dialogs/simple-input-dialog/simple-input-dialog.component';

@Component({
  selector: 'client-category-crud',
  templateUrl: './client-category-crud.component.html',
  styleUrl: './client-category-crud.component.scss'
})
export class ClientCategoryCRUDComponent {
  isLoading = false;
  clientCategoryData: ClientCategory[] = [];
  searchTerm = '';

  // Permission flags
  canCreateClientCategory: boolean = true;
  canReadClientCategory: boolean = true;
  canUpdateClientCategory: boolean = true;
  canDeleteClientCategory: boolean = true;


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
      formatter: (value: any, row: ClientCategory) => ({
        html: true,
        content: `<div class="status-indicator"><span class="circle-icon ${row.isActive ? 'active-icon' : 'inactive-icon'}"></span>
                  <span class="${row.isActive ? 'active-text' : 'inactive-text'}">${row.isActive ? 'Activo' : 'Inactivo'}</span></div>`,
      }),
      rawValue: (row: ClientCategory) => (row.isActive ? 'Activo' : 'Inactivo'), // Raw value for filtering
      showFilter: true,
    },
    {
      name: 'name',
      label: 'Nombre',
      type: 'input',
      sortable: true,
      rawValue: (row: ClientCategory) => row.name, // Use raw business name for filtering
      showFilter: true,
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'input',
      sortable: false,
      rawValue: (row: ClientCategory) => row.description, // Raw value for filtering
      showFilter: false,
    },
    {
      name: 'notes',
      label: 'Notas',
      type: 'input',
      sortable: false,
      rawValue: (row: ClientCategory) => row.notes, // Raw value for filtering
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
    this.canUpdateClientCategory = this.authService.hasPermission('canUpdateCategory');
    this.canDeleteClientCategory = this.authService.hasPermission('canDeleteCategory');
    this.canCreateClientCategory = this.authService.hasPermission('canCreateCategory');

    // Conditionally add 'action' column based on permissions
    if (this.canUpdateClientCategory || this.canDeleteClientCategory) {
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
    this.clientsService.getAllClientCategories().subscribe(
      (categories) => {
        this.clientCategoryData = categories;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.toastService.showError(
          'Error al cargar las categorías',
          'error-snackbar',
        );
      },
    );
  }

  getStatusClass(row: ClientCategory): string {
    return row.isActive ? 'active-icon' : 'inactive-icon';
  }

  openDeleteClientCategoryDialog(category: ClientCategory): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: '¿Estás seguro de desactivar esta categoría?',
      message: 'La categoría será desactivada temporalmente. No podrás asignarla a nuevos clientes hasta que la actives de nuevo.',
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
        this.deleteClientCategory(category);
      }
    });
  }

  /**
   * Opens the add branch office dialog.
   */
  openCreateClientCategoryDialog() {
    const categoryDialogFields = [
      { name: 'name', label: 'Nombre', placeholder: 'Ej: Corporativo, No Fiscal, Pyme, etc.', type: 'text', validators: [Validators.required], errorText: 'El nombre es requerido' },
      { name: 'description', label: 'Descripción', placeholder: '(Opcional)', type: 'textarea', validators: [] },
      { name: 'notes', label: 'Notas', placeholder: 'Notas adicionales', type: 'textarea', validators: [] },
    ];
    if (!this.canCreateClientCategory) {
      // Optional: Show a message or handle unauthorized access
      return;
    }
    this.dialog.open(SimpleInputDialogComponent, {
      data: {
        title: 'Agregar Categoría',
        actionLabel: 'Guardar',
        icon: 'add',
        fields: categoryDialogFields,
        initialValues: {}
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.submitCreateClientCategory(result);
      }
    });
  }

  openEditCategoryDialog(category: ClientCategory) {
    const categoryDialogFields = [
      { name: 'name', label: 'Nombre', placeholder: 'Ej: Sucursal Centro', type: 'text', validators: [Validators.required], errorText: 'El nombre es requerido' },
      { name: 'description', label: 'Descripción', placeholder: 'Opcional', type: 'textarea', validators: [] },
      { name: 'notes', label: 'Notas', placeholder: 'Notas adicionales', type: 'textarea', validators: [] },
      { name: 'isActive', label: 'Activo', type: 'checkbox', validators: [] }
    ];

    if (!this.canUpdateClientCategory) {
      // Optional: Show a message or handle unauthorized access
      return;
    }

    this.dialog.open(SimpleInputDialogComponent, {
      data: {
        title: 'Editar Categoría',
        actionLabel: 'Guardar',
        icon: 'edit',
        fields: categoryDialogFields,
        initialValues: category
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.submitEditClientCategory(category.id, result);
      }
    });
  }

  deleteClientCategory(category: ClientCategory): void {
    if (!this.canDeleteClientCategory) {
      // Optional: Show a message or handle unauthorized access
      return;
    }
    if (category.id) {
      this.clientsService.deleteClientCategory(category.id).subscribe(
        () => {
          this.toastService.showSuccess(
            'Categoría desactivada con éxito',
            'Aceptar',
          );
          this.loadData(); // Recarga los datos después de eliminar
        },
        (error) => {
          this.toastService.showError(
            error.error?.message || 'Error al desactivar categoría',
            'Cerrar',
          );
        },
      );
    }
  }

  submitCreateClientCategory(data: ClientCategory) {
    this.isLoading = true;
    this.clientsService.createClientCategory(data).subscribe({
      next: (createdCategory) => {
        this.toastService.showSuccess('Categoría creada con éxito', 'Aceptar');
        this.loadData();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastService.showError(
          error.error?.message || 'Error al crear categoría',
          'Cerrar'
        );
        this.isLoading = false;
      }
    });
  }

  submitEditClientCategory(id: string, data: ClientCategory) {
    this.isLoading = true;
    this.clientsService.updateClientCategory(id, data).subscribe({
      next: (updatedCategory) => {
        this.toastService.showSuccess('Categoría actualizada con éxito', 'Aceptar');
        this.loadData();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastService.showError(
          error.error?.message || 'Error al actualizar categoría',
          'Cerrar'
        );
        this.isLoading = false;
      }
    });
  }
}
