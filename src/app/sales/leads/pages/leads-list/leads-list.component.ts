import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { LeadsService } from '../../services/leads.service';
import { Lead } from 'src/app/sales/interfaces/leads.interface';

@Component({
  selector: 'app-leads-list',
  templateUrl: './leads-list.component.html',
  styleUrls: ['./leads-list.component.scss'],
})
export class LeadsListComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<Lead>();
  filterValue = '';
  isLoadingData = false;
  leadData: Lead[] = [];
  displayedColumns: string[] = [
    'status',
    'client',
    'product_interested',
    'email',
    'last_contacted',
    'assigned',
    'action',
  ];
  searchTerm = '';
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private leadsService: LeadsService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const currentUserRoles = this.authService.getCurrentUserRoles();
    if (currentUserRoles) {
      if (currentUserRoles.includes('admin')) {
        this.leadsService.getAllLeads().subscribe(
          (leads) => {
            this.leadData = leads;
            this.leadData.sort((a, b) => {
              const lastCommunicationA =
                a.communications && a.communications.length > 0
                  ? new Date(a.communications[a.communications.length - 1].date)
                  : new Date(0);
              const lastCommunicationB =
                b.communications && b.communications.length > 0
                  ? new Date(b.communications[b.communications.length - 1].date)
                  : new Date(0);

              return (
                lastCommunicationB.getTime() - lastCommunicationA.getTime()
              );
            });
            this.dataSource.data = this.leadData; // Assign the data to the dataSource
            console.log(this.leadData);
          },
          (error) => {
            console.log(error);
          }
        );
      } else if (currentUserRoles.includes('vendor')) {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && currentUser.id) {
          this.leadsService.getLeadsbyVendor(currentUser.id).subscribe(
            (leads) => {
              this.leadData = leads;
              this.leadData.sort((a, b) => {
                const lastCommunicationA =
                  a.communications && a.communications.length > 0
                    ? new Date(
                      a.communications[a.communications.length - 1].date
                    )
                    : new Date(0);
                const lastCommunicationB =
                  b.communications && b.communications.length > 0
                    ? new Date(
                      b.communications[b.communications.length - 1].date
                    )
                    : new Date(0);

                return (
                  lastCommunicationB.getTime() - lastCommunicationA.getTime()
                );
              });
              this.dataSource.data = this.leadData; // Assign the data to the dataSource
              console.log(this.leadData);
            },
            (error) => {
              console.log(error);
            }
          );
        }
      }
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item: Lead, property: string) => {
      switch (property) {
        case 'last_contacted':
          return item.communications && item.communications.length > 0
            ? new Date(
              item.communications[item.communications.length - 1].date
            ).getTime()
            : 0;
        default:
          return String(item[property as keyof Lead]);
      }
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getLastCommunicationTime(lead: Lead): string {
    if (lead.communications && lead.communications.length > 0) {
      const sortedCommunications = lead.communications.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const lastCommunicationDate = new Date(sortedCommunications[0].date);
      const diffInMilliseconds = Date.now() - lastCommunicationDate.getTime();
      const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return 'Menos de una hora';
      } else if (diffInHours < 24) {
        return Math.floor(diffInHours) === 1 ? '1 hora' : `${Math.floor(diffInHours)} horas`;
      } else {
        const diffInDays = diffInHours / 24;
        return Math.floor(diffInDays) === 1 ? '1 día' : `${Math.floor(diffInDays)} días`;
      }
    }
    return 'Sin comunicaciones';
  }

  getCommunicationClass(lead: Lead): string {
    if (lead.communications && lead.communications.length > 0) {
      const sortedCommunications = lead.communications.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const lastCommunicationDate = new Date(sortedCommunications[0].date);
      const diffInMilliseconds = Date.now() - lastCommunicationDate.getTime();
      const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);

      if (diffInDays <= 1) {
        return 'within-one-days'; // Green if within 1 days
      } else if (diffInDays <= 3) {
        return 'within-three-days'; // Light Green if within 4 days
      } else if (diffInDays <= 5) {
        return 'within-five-days'; // Yellow if within 5 days
      } else if (diffInDays <= 7) {
        return 'within-seven-days'; // Orange if within 7 days
      } else {
        return 'more-than-seven-days'; // Red if more than 14 days
      }
    }
    return 'no-communications'; // Transparent if no communications
  }

  getStatusClass(lead: Lead): string {
    if (lead.status === 'prospect') {
      return 'prospect-class';
    } else if (lead.status === 'client') {
      return 'client-class';
    } else if (lead.status === 'no-client') {
      return 'no-client-class';
    } else {
      return '';
    }
  }

  openConfirmDialog(lead: Lead): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Estas seguro de eliminar este cliente potencial?',
      message: 'El cliente potencial será eliminado permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (lead.id) {
          this.deleteLead(lead);
        }
      }
    });
  }
  addLead() {
    this.router.navigate(['sales/leads/create']);
  }

  seeLead(lead: Lead) {
    this.router.navigate([`sales/leads/${lead.id}`]);
  }

  editLead(lead: Lead) {
    this.router.navigate([`sales/leads/${lead.id}/edit`]);
  }

  deleteLead(lead: Lead) {
    if (lead.id) {

      this.leadsService.deleteLead(String(lead.id)).subscribe(
        (response) => {
          // Update consumibleData
          this.leadData = this.leadData.filter((p) => p.id !== lead.id);

          // Update dataSource
          this.dataSource.data = this.leadData;
          this.toastService.showSuccess(
            'Cliente potencial eliminado con éxito',
            'Aceptar'
          );
        },
        (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
        }
      );
    }
  }
}
