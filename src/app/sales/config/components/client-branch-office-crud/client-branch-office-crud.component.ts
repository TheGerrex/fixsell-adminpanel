import { Component } from '@angular/core';
import { TableColumn } from '../client-config-table/client-config-table.component';
import { BranchOffice } from 'src/app/sales/clients/interfaces/client.interface';
import { ClientsService } from 'src/app/sales/clients/services/clients.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { SimpleInputDialogComponent } from 'src/app/shared/components/dialogs/simple-input-dialog/simple-input-dialog.component';
import { Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'client-branch-office-crud',
  templateUrl: './client-branch-office-crud.component.html',
  styleUrl: './client-branch-office-crud.component.scss'
})
export class ClientBranchOfficeCRUDComponent {
  branchOfficeData: BranchOffice[] = [];
  isLoading = false;
  searchTerm = '';

  // Permission flags
  canCreateClientBranchOffice: boolean = true;
  canReadClientBranchOffice: boolean = true;
  canUpdateClientBranchOffice: boolean = true;
  canDeleteClientBranchOffice: boolean = true;

  // Define columns for the data table
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
      formatter: (value: any, row: BranchOffice) => ({
        html: true,
        content: `<div class="status-indicator"><span class="circle-icon ${row.isActive ? 'active-icon' : 'inactive-icon'}"></span>
                  <span class="${row.isActive ? 'active-text' : 'inactive-text'}">${row.isActive ? 'Activo' : 'Inactivo'}</span></div>`,
      }),
      rawValue: (row: BranchOffice) => (row.isActive ? 'Activo' : 'Inactivo'), // Raw value for filtering
      showFilter: true,
    },
    {
      name: 'name',
      label: 'Nombre',
      type: 'input',
      sortable: true,
      rawValue: (row: BranchOffice) => row.name, // Use raw business name for filtering
      showFilter: true,
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'input',
      sortable: false,
      rawValue: (row: BranchOffice) => row.description, // Raw value for filtering
      showFilter: false,
    },
    {
      name: 'notes',
      label: 'Notas',
      type: 'input',
      sortable: false,
      rawValue: (row: BranchOffice) => row.notes, // Raw value for filtering
      showFilter: false,
    },
  ];

  constructor(
    private clientsService: ClientsService,
    private toastService: ToastService,
    private authService: AuthService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  initializePermissions(): void {
    this.canUpdateClientBranchOffice = this.authService.hasPermission('canUpdateBranchOffice');
    this.canDeleteClientBranchOffice = this.authService.hasPermission('canDeleteBranchOffice');
    this.canCreateClientBranchOffice = this.authService.hasPermission('canCreateBranchOffice');

    // Conditionally add 'action' column based on permissions
    if (this.canUpdateClientBranchOffice || this.canDeleteClientBranchOffice) {
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
    this.clientsService.getBranchOffices().subscribe(
      (branches) => {
        this.branchOfficeData = branches;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.toastService.showError(
          'Error al cargar las sucursales',
          'error-snackbar',
        );
      },
    );
  }

  getStatusClass(row: BranchOffice): string {
    return row.isActive ? 'active-icon' : 'inactive-icon';
  }


  openConfirmDialog(branch: BranchOffice): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: '¿Estás seguro de desactivar esta sucursal?',
      message: 'La sucursal será desactivada temporalmente. No podrás asignarla a nuevos clientes hasta que la actives de nuevo.',
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
        this.deleteBranchOffice(branch);
      }
    });
  }

  /**
   * Opens the add branch office dialog.
   */
  openAddBranchOfficeDialog() {
    const branchOfficeDialogFields = [
      { name: 'name', label: 'Nombre', placeholder: 'Ej: Sucursal Centro', type: 'text', validators: [Validators.required], errorText: 'El nombre es requerido' },
      { name: 'description', label: 'Descripción', placeholder: '(Opcional)', type: 'textarea', validators: [] },
      { name: 'notes', label: 'Notas', placeholder: 'Notas adicionales', type: 'textarea', validators: [] },
    ];
    if (!this.canCreateClientBranchOffice) {
      // Optional: Show a message or handle unauthorized access
      return;
    }
    this.dialog.open(SimpleInputDialogComponent, {
      data: {
        title: 'Agregar Sucursal',
        actionLabel: 'Guardar',
        icon: 'add',
        fields: branchOfficeDialogFields,
        initialValues: {}
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.submitCreateBranchOffice(result);
      }
    });
  }

  openEditBranchOfficeDialog(branchOffice: BranchOffice) {
    const branchOfficeDialogFields = [
      { name: 'name', label: 'Nombre', placeholder: 'Ej: Sucursal Centro', type: 'text', validators: [Validators.required], errorText: 'El nombre es requerido' },
      { name: 'description', label: 'Descripción', placeholder: '(Opcional)', type: 'textarea', validators: [] },
      { name: 'notes', label: 'Notas', placeholder: 'Notas adicionales', type: 'textarea', validators: [] },
      { name: 'isActive', label: 'Activo', type: 'checkbox', validators: [] }
    ];

    if (!this.canUpdateClientBranchOffice) {
      // Optional: Show a message or handle unauthorized access
      return;
    }

    this.dialog.open(SimpleInputDialogComponent, {
      data: {
        title: 'Editar Sucursal',
        actionLabel: 'Guardar',
        icon: 'edit',
        fields: branchOfficeDialogFields,
        initialValues: branchOffice
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.submitEditBranchOffice(branchOffice.id, result);
      }
    });
  }

  deleteBranchOffice(branch: BranchOffice): void {
    if (!this.canDeleteClientBranchOffice) {
      // Optional: Show a message or handle unauthorized access
      return;
    }
    if (branch.id) {
      this.clientsService.deleteBranchOffice(branch.id).subscribe(
        () => {
          this.toastService.showSuccess(
            'Sucursal desactivada con éxito',
            'Aceptar',
          );
          this.loadData(); // Recarga los datos después de eliminar
        },
        (error) => {
          this.toastService.showError(
            error.error?.message || 'Error al desactivar sucursal',
            'Cerrar',
          );
        },
      );
    }
  }

  submitCreateBranchOffice(data: BranchOffice) {
    this.isLoading = true;
    this.clientsService.createBranchOffice(data).subscribe({
      next: (createdBranch) => {
        this.toastService.showSuccess('Sucursal creada con éxito', 'Aceptar');
        this.loadData();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastService.showError(
          error.error?.message || 'Error al crear sucursal',
          'Cerrar'
        );
        this.isLoading = false;
      }
    });
  }

  submitEditBranchOffice(id: string, data: BranchOffice) {
    this.isLoading = true;
    this.clientsService.updateBranchOffice(id, data).subscribe({
      next: (updatedBranch) => {
        this.toastService.showSuccess('Sucursal actualizada con éxito', 'Aceptar');
        this.loadData();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastService.showError(
          error.error?.message || 'Error al actualizar sucursal',
          'Cerrar'
        );
        this.isLoading = false;
      }
    });
  }


}
