import { HttpClient } from '@angular/common/http';
import { Component, Injectable, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Consumible } from 'src/app/website/interfaces/consumibles.interface';
import { environment } from 'src/environments/environments';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-consumibles-list',
  templateUrl: './consumibles-list.component.html',
  styleUrls: ['./consumibles-list.component.scss'],
})
export class ConsumiblesListComponent {
  displayedColumns: string[] = [
    //consumibles columns
    /*
        name: string;
        price: number;
        weight: number;
        longDescription: string;
        shortDescription: string;
        thumbnailImage: string;
        images: string[];
        category: string;
        stock: number;
        location: string;
    */
    'name',
    'price',
    'weight',
    'category',
    'stock',
    'location',
    'action',
  ];
  dataSource = new MatTableDataSource<Consumible>();
  filterValue = '';
  isAdmin = false;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private dialogService: DialogService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.http
      .get<Consumible[]>(`${environment.baseUrl}/consumibles`)
      .subscribe((data) => {
        console.log(data);

        // Filter out consumibles with null or undefined fields if necessary
        // const filteredData = data.filter((consumible) => consumible.field !== null);

        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
      });

    const userRoles = this.authService.getCurrentUserRoles();
    this.isAdmin = userRoles.includes('admin');
    if (!this.isAdmin) {
      this.displayedColumns = [
        'name',
        'price',
        'weight',
        'category',
        'stock',
        'location',
      ];
    }
  }

  addConsumible() {
    this.router.navigateByUrl('website/consumibles/create');
  }

  seeConsumible(consumible: Consumible) {
    this.router.navigateByUrl(`website/consumibles/${consumible.id}`);
  }

  editConsumible(consumible: Consumible) {
    this.router.navigateByUrl(`website/consumibles/${consumible.id}/edit`);
  }

  deleteConsumible(consumible: Consumible) {
    this.dialogService
      .openConfirmDialog('Are you sure?', 'Yes', 'delete-dialog') // Add 'delete-dialog' class
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.http
            .delete(`${environment.baseUrl}/consumibles/${consumible.id}`)
            .subscribe(
              (response) => {
                console.log(response); // This should log "Consumible with ID x has been removed"
                // Show a toast message after the user confirms the deletion
                this.toastService.showSuccess(
                  'Consumible deleted successfully',
                  'OK'
                );

                // Remove the deleted consumible from the dataSource
                const data = this.dataSource.data;
                this.dataSource.data = data.filter(
                  (c) => c.id !== consumible.id
                );
              },
              (error) => {
                console.error('Error:', error);
                this.dialogService.openErrorDialog(
                  'Error deleting consumible',
                  'OK',
                  'delete-dialog'
                ); // Show error dialog with 'delete-dialog' class
              }
            );
        }
      });
  }
}
