import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
//src\app\website\config\services\brand.service.ts
import { BrandService } from 'src/app/website/config/services/brand.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';
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
  CategoriesDataSource = new MatTableDataSource<Category>();
  CategoriesDisplayedColumns: string[] = ['name', 'action'];
  dataSource = new MatTableDataSource<Category>();
  filterValue = '';
  isAdmin = false;
  categoryData: Category[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private categoryService: CategoryService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

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
      this.CategoriesDataSource.data = category;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.CategoriesDataSource.filter = filterValue.trim().toLowerCase();
  }

  deleteCategory(id: number, category: Category) {
    // open confirm-dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Category',
        message: `Seguro que quieres eliminar la categoria ${category}?`,
        buttonText: { cancel: 'Cancelar', ok: 'Si' },
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

  editCategory(category: Category) {}

  addCategory() {
    //open dialog
    const dialogRef = this.dialog.open(AddPrinterCategoryDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      this.getCategory();
    });
  }
}
