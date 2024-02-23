import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Brand } from './brand.interface';
//src\app\website\config\services\brand.service.ts
import { BrandService } from 'src/app/website/config/services/brand.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { AddPrinterBrandDialogComponent } from 'src/app/shared/components/add-printer-brand-dialog/add-printer-brand-dialog.component';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
@Component({
  selector: 'app-brand-crud',
  templateUrl: './brand-crud.component.html',
  styleUrls: ['./brand-crud.component.scss'],
})
export class BrandCrudComponent implements OnInit {
  brandsDataSource = new MatTableDataSource<Brand>();
  brandsDisplayedColumns: string[] = ['name', 'action'];
  dataSource = new MatTableDataSource<Brand>();
  filterValue = '';
  isAdmin = false;
  brandData: Brand[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private brandService: BrandService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getBrands();

    const userRoles = this.authService.getCurrentUserRoles();
    this.isAdmin = userRoles.includes('admin');
    if (!this.isAdmin) {
      this.brandsDisplayedColumns = ['name'];
    }
  }

  getBrands() {
    this.brandService.getBrands().subscribe((brands: Brand[]) => {
      this.brandsDataSource.data = brands;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.brandsDataSource.filter = filterValue.trim().toLowerCase();
  }

  deleteBrand(id: number, brand: Brand) {
    // open confirm-dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Brand',
        message: `Seguro que quieres borrar la marca ${brand}?`,
        buttonText: { cancel: 'Cancelar', ok: 'Si' },
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.brandService.deleteBrand(id).subscribe(() => {
          this.getBrands();
        });
      }
    });
  }

  editBrand(brand: Brand) {}

  addBrand() {
    //open dialog
    const dialogRef = this.dialog.open(AddPrinterBrandDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      this.getBrands();
    });
  }
}
