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
import { Printer } from 'src/app/website/interfaces/printer.interface';
import { environment } from 'src/environments/environment';
import swal from 'sweetalert2';
import { DealService } from '../../services/deal.service';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Deal } from 'src/app/website/interfaces/deal.interface';

@Component({
  selector: 'app-deal-list',
  templateUrl: './deal-list.component.html',
  styleUrls: ['./deal-list.component.scss'],
})
export class DealListComponent implements OnInit {
  displayedColumns: string[] = [
    'brand',
    'model',
    'price',
    'dealPrice',
    'dealStartDate',
    'dealEndDate',
    'action',
  ];
  dataSource = new MatTableDataSource<Deal>();
  filterValue = '';
  isAdmin = false;
  dealData: Deal[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private toastService: ToastService,
    private dealService: DealService
  ) {}

  ngOnInit() {
    this.dealService.getAllDeals().subscribe((deals) => {
      this.dealData = deals.filter(
        (deal: { printer: null; consumible: null }) =>
          deal.printer !== null || deal.consumible !== null
      );
      console.log(this.dealData);
      this.dataSource = new MatTableDataSource(this.dealData);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.dataSource.filterPredicate = (data: Deal, filter: string) => {
        const dataStr =
          data.printer.brand +
          data.printer.model +
          data.printer.price +
          data.dealPrice +
          data.dealCurrency +
          data.dealDiscountPercentage +
          data.dealEndDate +
          data.dealStartDate;
        return dataStr.trim().toLowerCase().indexOf(filter) != -1;
      };
    });

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
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  deleteDeal(deal: Deal) {
    this.dialogService
      .openConfirmDialog('Are you sure?', 'Yes', 'delete-dialog') // Add 'delete-dialog' class
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.dealService.deleteDealById(deal.id).subscribe(
            (response) => {
              console.log(response); // This should log "Deal with ID 10 has been removed"
              // Show a toast message after the user confirms the deletion
              this.toastService.showSuccess(
                'Printer deleted successfully',
                'OK'
              );

              // Remove the deleted deal from the dataSource
              const data = this.dataSource.data;
              this.dataSource.data = data.filter((d) => d.id !== deal.id);
            },
            (error) => {
              console.error('Error:', error);
              this.dialogService.openErrorDialog(
                'Error deleting deal',
                'OK',
                'delete-dialog'
              ); // Show error dialog with 'delete-dialog' class
            }
          );
        }
      });
  }

  addPaquete() {
    this.router.navigate(['/website/paquete/create']);
  }
}
