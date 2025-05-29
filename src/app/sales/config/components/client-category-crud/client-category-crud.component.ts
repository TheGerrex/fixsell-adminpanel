import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ClientCategory } from 'src/app/sales/clients/interfaces/client.interface';
import { ClientsService } from 'src/app/sales/clients/services/clients.service';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from 'src/app/shared/services/toast.service';
import { EditClientCategoryDialogComponent } from '../dialogs/edit-client-category-dialog/edit-client-category-dialog.component';
import { AddClientCategoryDialogComponent } from '../dialogs/add-client-category-dialog/add-client-category-dialog.component';

@Component({
  selector: 'client-category-crud',
  templateUrl: './client-category-crud.component.html',
  styleUrl: './client-category-crud.component.scss'
})
export class ClientCategoryCRUDComponent {
  clientCategoriesDisplayedColumns: string[] = ['isActive', 'name', 'action'];
  dataSource = new MatTableDataSource<ClientCategory>();
  searchTerm = '';
  isLoadingData = false;
  clientCategoryData: ClientCategory[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Permission flags
  canEditClientCategoy: boolean = true;
  canDeleteClientCategoy: boolean = true;
  canAddClientCategoy: boolean = true;

  constructor(
    private authService: AuthService,
    private clientService: ClientsService,
    private dialog: MatDialog,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.initializePermissions();
    this.getClientCategories();
  }

  /**
   * Initializes brand-related permissions by checking with AuthService.
   */
  initializePermissions(): void {
    this.canEditClientCategoy = this.authService.hasPermission('canUpdateBrand');
    this.canDeleteClientCategoy = this.authService.hasPermission('canDeleteBrand');
    this.canAddClientCategoy = this.authService.hasPermission('canCreateBrand');

    // Conditionally add 'action' column based on permissions
    if (this.canEditClientCategoy || this.canDeleteClientCategoy) {
      if (!this.clientCategoriesDisplayedColumns.includes('action')) {
        this.clientCategoriesDisplayedColumns.push('action');
      }
    } else {
      // Remove 'action' column if no permissions
      this.clientCategoriesDisplayedColumns = this.clientCategoriesDisplayedColumns.filter(
        (col) => col !== 'action',
      );
    }
  }

  /**
   * Fetches all brands data from the server.
   */
  getClientCategories() {
    this.isLoadingData = true;
    this.clientService.getAllClientCategories().subscribe(
      (clientCategories: ClientCategory[]) => {
        this.clientCategoryData = clientCategories;
        this.dataSource = new MatTableDataSource(clientCategories);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.isLoadingData = false;
      },
      (error: any) => {
        console.error('Error:', error);
        this.isLoadingData = false;
      },
    );
  }

  /**
   * Applies filter to the data table based on user input.
   * @param event The input event containing the filter value.
   */
  applyFilter(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.dataSource.filter = searchTerm.trim().toLowerCase();
  }

  /**
   * Opens a confirmation dialog before deleting a brand.
   * @param id The ID of the brand to delete.
   * @param brand The brand object to delete.
   */
  deleteClientCategory(id: string, client_category: ClientCategory) {
    // Open confirm-dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Desactivar categoria de cliente',
        message: `¿Seguro que quieres deshabilitar la categoria ${client_category.name}?`,
        buttonText: { cancel: 'Cancelar', ok: 'Desactivar' },
        buttonIcon: {
          cancel: 'check_circle',
          ok: 'block',
        }
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.clientService.deleteClientCategory(id).subscribe(() => {
          this.getClientCategories();
        });
        this.toastService.showSuccess(
          'Categoria desactivada con éxito',
          'Cerrar',
        );
      }
    });
  }

  /**
   * Opens the edit brand dialog.
   * @param id The ID of the brand to edit.
   * @param brand The brand object to edit.
   */
  editClientCategory(id: string, client_category: ClientCategory) {
    if (!this.canEditClientCategoy) {
      // Optional: Show a message or handle unauthorized access
      return;
    }
    const dialogRef = this.dialog.open(EditClientCategoryDialogComponent, {
      data: { id: id, categoryName: client_category.name, isActive: client_category.isActive },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getClientCategories();
    });
  }

  /**
   * Opens the add brand dialog.
   */
  addClientCategory() {
    if (!this.canAddClientCategoy) {
      // Optional: Show a message or handle unauthorized access
      return;
    }
    const dialogRef = this.dialog.open(AddClientCategoryDialogComponent);

    dialogRef.afterClosed().subscribe(() => {
      this.getClientCategories();
    });
  }
}
