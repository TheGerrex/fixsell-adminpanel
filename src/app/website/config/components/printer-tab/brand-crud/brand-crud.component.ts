// brand-crud.component.ts
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
  isLoadingData = false;
  brandData: Brand[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Permission flags
  canEditBrand: boolean = false;
  canDeleteBrand: boolean = false;
  canAddBrand: boolean = false;

  constructor(
    private authService: AuthService,
    private brandService: BrandService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.initializePermissions();
    this.getBrands();
  }

  /**
   * Initializes brand-related permissions by checking with AuthService.
   */
  initializePermissions(): void {
    this.canEditBrand = this.authService.hasPermission('canUpdateBrand');
    this.canDeleteBrand = this.authService.hasPermission('canDeleteBrand');
    this.canAddBrand = this.authService.hasPermission('canCreateBrand');

    // Conditionally add 'action' column based on permissions
    if (this.canEditBrand || this.canDeleteBrand) {
      if (!this.brandsDisplayedColumns.includes('action')) {
        this.brandsDisplayedColumns.push('action');
      }
    } else {
      // Remove 'action' column if no permissions
      this.brandsDisplayedColumns = this.brandsDisplayedColumns.filter(
        (col) => col !== 'action',
      );
    }
  }

  /**
   * Fetches all brands data from the server.
   */
  getBrands() {
    this.isLoadingData = true;
    this.brandService.getBrands().subscribe(
      (brands: Brand[]) => {
        this.brandData = brands;
        this.dataSource = new MatTableDataSource(brands);
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
   * Opens a confirmation dialog before deleting a brand.
   * @param id The ID of the brand to delete.
   * @param brand The brand object to delete.
   */
  deleteBrand(id: number, brand: Brand) {
    // Open confirm-dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar marca',
        message: `¿Seguro que quieres eliminar la marca ${brand.name}?`,
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

  /**
   * Opens the edit brand dialog.
   * @param id The ID of the brand to edit.
   * @param brand The brand object to edit.
   */
  editBrand(id: number, brand: Brand) {
    if (!this.canEditBrand) {
      // Optional: Show a message or handle unauthorized access
      return;
    }
    const dialogRef = this.dialog.open(EditPrinterBrandDialogComponent, {
      data: { brandId: id, brandName: brand.name },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getBrands();
    });
  }

  /**
   * Opens the add brand dialog.
   */
  addBrand() {
    if (!this.canAddBrand) {
      // Optional: Show a message or handle unauthorized access
      return;
    }
    const dialogRef = this.dialog.open(AddPrinterBrandDialogComponent);

    dialogRef.afterClosed().subscribe(() => {
      this.getBrands();
    });
  }
}
