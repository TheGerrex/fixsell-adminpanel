import { Component } from '@angular/core';
import { TableColumn } from '../client-config-table/client-config-table.component';
import { BranchOffice } from 'src/app/sales/clients/interfaces/client.interface';
import { ClientsService } from 'src/app/sales/clients/services/clients.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'client-branch-office-crud',
  templateUrl: './client-branch-office-crud.component.html',
  styleUrl: './client-branch-office-crud.component.scss'
})
export class ClientBranchOfficeCRUDComponent {
  branchOfficeData: BranchOffice[] = [];
  isLoading = false;
  searchTerm = '';

  // Define columns for the data table
  displayedColumns: string[] = [
    'isActive',
    'name',
    'description',
    'notes',
  ];

  columns: TableColumn[] = [
    {
      name: 'isActive',
      label: 'Estado',
      type: 'select',
      sortable: true,
      formatter: (value: any, row: BranchOffice) => ({
        html: true,
        content: `
            <mat-icon class="${this.getStatusClass(row)}">
            ${row.isActive ? 'check_circle' : 'cancel'}</mat-icon>
        `,
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
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.loadData();
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
      message: 'La sucursal será desactivada permanentemente.',
      buttonText: {
        ok: 'Desactivar',
        cancel: 'Cancelar',
      },
      buttonIcon: {
        ok: 'cancel',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.deleteBranchOffice(branch);
      }
    });
  }

  deleteBranchOffice(branch: BranchOffice): void {
    if (branch.id) {
      this.clientsService.deleteBranchOffice(branch.id).subscribe(
        () => {
          this.branchOfficeData = this.branchOfficeData.filter((b) => b.id !== branch.id);
          this.toastService.showSuccess(
            'Sucursal eliminada con éxito',
            'Aceptar',
          );
        },
        (error) => {
          this.toastService.showError(
            error.error?.message || 'Error al eliminar sucursal',
            'Cerrar',
          );
        },
      );
    }
  }

  editBranchOffice(branch: BranchOffice): void {
    // Implement the logic to edit the branch office
    // This could involve navigating to an edit form or opening a dialog
    console.log('Edit branch office:', branch);
  }

  addBranchOffice(): void {
    // Implement the logic to add a new branch office
    // This could involve navigating to a create form or opening a dialog
    console.log('Add new branch office');

  }


}
