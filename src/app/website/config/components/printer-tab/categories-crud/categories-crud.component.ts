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
@Component({
  selector: 'app-categories-crud',
  templateUrl: './categories-crud.component.html',
  styleUrls: ['./categories-crud.component.scss'],
})
export class CategoriesCrudComponent {
  CategoriesDisplayedColumns: string[] = ['name', 'action'];
  dataSource = new MatTableDataSource<Category>();
  searchTerm = '';
  isAdmin = false;
  isLoadingData = false;
  categoryData: Category[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.getCategory();

    const userRoles = this.authService.getCurrentUserRoles();
    this.isAdmin = userRoles.includes('admin');
    if (!this.isAdmin) {
      this.CategoriesDisplayedColumns = ['name'];
    }
  }

  getCategory() {
    this.categoryService.getCategory().subscribe((category: Category[]) => {
      this.categoryData = category;
      this.dataSource = new MatTableDataSource(category);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.isLoadingData = false;
    }, (error) => {
      console.error('Error:', error);
      this.isLoadingData = false;
    });
  }

  applyFilter(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.dataSource.filter = searchTerm.trim().toLowerCase();
  }

  deleteCategory(id: number, category: Category) {
    // open confirm-dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar categoria',
        message: `Seguro que quieres eliminar la categoria ${category}?`,
        buttonText: { cancel: 'Cancelar', ok: 'Eliminar' },
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.categoryService.deleteCategory(id).subscribe(() => {
          this.getCategory();
        });
      }
    });
  }

  editCategory(category: Category) { }

  addCategory() {
    //open dialog
    const dialogRef = this.dialog.open(AddPrinterCategoryDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      this.getCategory();
    });
  }
}
