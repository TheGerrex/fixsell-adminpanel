// categories-crud.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/services/auth.service';
import { AddPrinterCategoryDialogComponent } from 'src/app/shared/components/add-printer-category-dialog/add-printer-category-dialog.component';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { Category } from './categories.interface';
import { CategoryService } from '../../../services/category.service';
import { EditPrinterCategoryDialogComponent } from 'src/app/shared/components/edit-printer-category-dialog/edit-printer-category-dialog.component';
import { ToastService } from '../../../../../shared/services/toast.service';

@Component({
  selector: 'app-categories-crud',
  templateUrl: './categories-crud.component.html',
  styleUrls: ['./categories-crud.component.scss'],
})
export class CategoriesCrudComponent implements OnInit {
  CategoriesDisplayedColumns: string[] = ['name', 'action'];
  dataSource = new MatTableDataSource<Category>();
  searchTerm = '';
  isLoadingData = false;
  categoryData: Category[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Permission flags
  canEditCategory: boolean = false;
  canDeleteCategory: boolean = false;
  canAddCategory: boolean = false;

  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private toastService: ToastService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.initializePermissions();
    this.getCategory();
  }

  /**
   * Initializes category-related permissions by checking with AuthService.
   */
  initializePermissions(): void {
    this.canEditCategory = this.authService.hasPermission('canUpdateCategory');
    this.canDeleteCategory =
      this.authService.hasPermission('canDeleteCategory');
    this.canAddCategory = this.authService.hasPermission('canCreateCategory');

    // Conditionally add 'action' column based on permissions
    if (this.canEditCategory || this.canDeleteCategory) {
      if (!this.CategoriesDisplayedColumns.includes('action')) {
        this.CategoriesDisplayedColumns.push('action');
      }
    } else {
      // Remove 'action' column if no permissions
      this.CategoriesDisplayedColumns = this.CategoriesDisplayedColumns.filter(
        (col) => col !== 'action',
      );
    }
  }

  /**
   * Fetches all categories data from the server.
   */
  getCategory() {
    this.isLoadingData = true;
    this.categoryService.getCategory().subscribe(
      (category: Category[]) => {
        this.categoryData = category;
        this.dataSource = new MatTableDataSource(category);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.isLoadingData = false;
      },
      (error) => {
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
   * Opens a confirmation dialog before deleting a category.
   * @param id The ID of the category to delete.
   * @param category The category object to delete.
   */
  deleteCategory(id: number, category: Category) {
    if (!this.canDeleteCategory) {
      this.toastService.showError(
        'No tienes permisos para eliminar categorías',
        'Cerrar',
      );
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar categoría',
        message: `¿Seguro que quieres eliminar la categoría ${category.name}?`,
        buttonText: { cancel: 'Cancelar', ok: 'Eliminar' },
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.categoryService.deleteCategory(id).subscribe({
          next: () => {
            this.getCategory();
            this.toastService.showSuccess(
              'Categoría eliminada con éxito',
              'Cerrar',
            );
          },
          error: (error) => {
            this.toastService.showError(error.error.message, 'Cerrar');
          },
        });
      }
    });
  }

  /**
   * Opens the edit category dialog.
   * @param id The ID of the category to edit.
   * @param category The category object to edit.
   */
  editCategory(id: number, category: Category) {
    if (!this.canEditCategory) {
      this.toastService.showError(
        'No tienes permisos para editar categorías',
        'Cerrar',
      );
      return;
    }

    const dialogRef = this.dialog.open(EditPrinterCategoryDialogComponent, {
      data: { categoryId: id, categoryName: category.name },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getCategory();
    });
  }

  /**
   * Opens the add category dialog.
   */
  addCategory() {
    if (!this.canAddCategory) {
      this.toastService.showError(
        'No tienes permisos para agregar categorías',
        'Cerrar',
      );
      return;
    }

    const dialogRef = this.dialog.open(AddPrinterCategoryDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      this.getCategory();
    });
  }
}
