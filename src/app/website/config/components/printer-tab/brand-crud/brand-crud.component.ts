import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Brand } from './brand.interface';
import { BrandService } from 'src/app/website/config/services/brand.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/services/auth.service';
import { AddPrinterBrandDialogComponent } from 'src/app/shared/components/add-printer-brand-dialog/add-printer-brand-dialog.component';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { EditPrinterBrandDialogComponent } from 'src/app/shared/components/edit-printer-brand-dialog/edit-printer-brand-dialog.component';
@Component({
  selector: 'app-brand-crud',
  templateUrl: './brand-crud.component.html',
  styleUrls: ['./brand-crud.component.scss'],
})
export class BrandCrudComponent implements OnInit {
  brandsDisplayedColumns: string[] = ['name', 'action'];
  dataSource = new MatTableDataSource<Brand>();
  searchTerm = '';
  isAdmin = false;
  isLoadingData = false;
  brandData: Brand[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private authService: AuthService,
    private brandService: BrandService,
    private dialog: MatDialog
  ) { }

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
      this.brandData = brands;
      this.dataSource = new MatTableDataSource(brands);
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

  deleteBrand(id: number, brand: Brand) {
    // open confirm-dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar marca',
        message: `Seguro que quieres eliminar la marca ${brand}?`,
        buttonText: { cancel: 'Cancelar', ok: 'Eliminar' },
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

  editBrand(id: number, brand: Brand) {
    const dialogRef = this.dialog.open(EditPrinterBrandDialogComponent, {
      data: { brandId: id, brandName: brand.name }
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getBrands();
    });
  }

  addBrand() {
    const dialogRef = this.dialog.open(AddPrinterBrandDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      this.getBrands();
    });
  }
}
