import {
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { DealService } from '../../services/deal.service';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Deal } from 'src/app/website/interfaces/deal.interface';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-deal-list',
  templateUrl: './deal-list.component.html',
  styleUrls: ['./deal-list.component.scss'],
})
export class DealListComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<Deal>();
  searchTerm = '';
  isAdmin = false;
  dealData: Deal[] = [];
  isLoadingData = false;
  displayedColumns: string[] = [
    'brand',
    'model',
    'price',
    'dealPrice',
    'dealStartDate',
    'dealEndDate',
    'action',
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private toastService: ToastService,
    private dealService: DealService
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.loadData());
    const userRoles = this.authService.getCurrentUserRoles();
    this.isAdmin = userRoles.includes('admin');
    if (!this.isAdmin) {
      this.displayedColumns = [
        'brand',
        'model',
        'price',
        'dealPrice',
        'dealCurrency',
        'dealDiscountPercentage',
      ];
    }
  }

  loadData() {
    this.isLoadingData = true;
    this.dealService.getAllDeals().subscribe((deals) => {
      console.log('all deals:', deals);
      this.dealData = deals.filter(
        (deal: { printer: null; consumible: null }) =>
          deal.printer !== null || deal.consumible !== null
      );
      console.log(this.dealData);
      this.dataSource = new MatTableDataSource(this.dealData);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.isLoadingData = false;
      this.dataSource.filterPredicate = (data: Deal, filter: string) => {
        let dataStr = '';
        if (data.printer) {
          dataStr +=
            data.printer.brand +
            data.printer.model +
            data.printer.price;
        }
        if (data.consumible) {
          dataStr += data.consumible.name;
        }
        dataStr +=
          data.dealPrice +
          data.dealCurrency +
          data.dealDiscountPercentage +
          data.dealEndDate +
          data.dealStartDate;
        return dataStr.trim().toLowerCase().indexOf(filter) != -1;
      };
    });
  }

  seeDeal(deal: Deal) {
    this.router.navigate([`/website/deals/${deal.id}`], {
      state: { deal },
    });
  }

  editDeal(deal: Deal) {
    this.router.navigate([`/website/deals/${deal.id}/edit`], {
      state: { deal },
    });
  }

  addDeal() {
    this.router.navigate(['/website/deals/create']);
  }

  applyFilter(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.dataSource.filter = searchTerm.trim().toLowerCase();
  }

  openConfirmDialog(deal: Deal): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Estas seguro de eliminar esta promoción?',
      message: 'La promoción será eliminado permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (deal.id) {
          this.deleteDeal(deal)
        }

      }
    });
  }

  deleteDeal(deal: Deal) {
    if (deal.id) {
      this.dealService.deleteDealById(deal.id).subscribe(
        (response) => {
          this.dealData = this.dealData.filter((d) => d.id !== deal.id);
          this.dataSource.data = this.dealData;
          this.toastService.showSuccess('Promoción eliminado con éxito', 'Aceptar');
        },
        (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
        }
      );
    }
  }

  addPaquete() {
    this.router.navigate(['/website/paquete/create']);
  }
}
