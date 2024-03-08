import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  Injectable,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Consumible } from 'src/app/website/interfaces/consumibles.interface';
import { environment } from 'src/environments/environment';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { MatSort } from '@angular/material/sort';
import { ConsumiblesService } from '../../services/consumibles.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-consumibles-list',
  templateUrl: './consumibles-list.component.html',
  styleUrls: ['./consumibles-list.component.scss'],
})
export class ConsumiblesListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<Consumible>();
  filterValue = '';
  isAdmin = false;
  consumibleData: Consumible[] = [];
  isLoadingData = false;
  displayedColumns: string[] = [
    //consumibles columns
    'name',
    'sku',
    'brand',
    'yield',
    'origen',
    'price',
    // 'currency',
    'category',
    'action',
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private toastService: ToastService,
    private consumiblesService: ConsumiblesService,
  ) {}

  ngOnInit() {
    this.isLoadingData = true;
    this.consumiblesService.getAllConsumibles().subscribe((consumibles) => {
      this.consumibleData = consumibles;
      this.dataSource = new MatTableDataSource(consumibles);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.isLoadingData = false;
    }, (error) => {
      console.error('Error:', error);
      this.isLoadingData = false;
    });

    const userRoles = this.authService.getCurrentUserRoles();
    this.isAdmin = userRoles.includes('admin');
    if (!this.isAdmin) {
      this.displayedColumns = [
        'name',
        'sku',
        'brand',
        'yield',
        'origen',
        'price',
        // 'currency',
        'category',
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openConfirmDialog(consumible: Consumible): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Estas seguro de querer eliminar esta consumible?',
      message: 'El consumible sera eliminado permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (consumible.id){
            this.deleteConsumible(consumible)
        }
        
      }
    });
  }

  deleteConsumible(consumible: Consumible) {
  if (consumible.id){
    this.consumiblesService.deleteConsumible(consumible.id).subscribe(
      (response) => {
        // Update consumibleData
        this.consumibleData = this.consumibleData.filter((c) => c.id !== consumible.id);
        
        // Update dataSource
        this.dataSource.data = this.consumibleData;

        this.toastService.showSuccess('Consumible eliminado con exito', 'Aceptar');
      },
      (error) => {
        this.toastService.showError(error.error.message, 'Cerrar');
      }
      ); 
    }
  }
}
