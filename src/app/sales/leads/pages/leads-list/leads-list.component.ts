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
    'client',
    'status',
    'assigned',
    'product_interested',
    'email',
    'last_contacted',
    'action',
  ];
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private leadsService: LeadsService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

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
            this.dataSource.data = this.leadData; // Assign the data to the dataSource
            console.log(this.leadData);
          },
          (error) => {
            console.log(error);
          }
        );
      } else if (currentUserRoles.includes('vendor')) {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          this.leadsService.getLeadsbyVendor(currentUser.id).subscribe(
            (leads) => {
              this.leadData = leads;
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getLastCommunicationTime(lead: Lead): string {
    if (lead.communications && lead.communications.length > 0) {
      const lastCommunicationDate = new Date(
        lead.communications[lead.communications.length - 1].date
      );
      const diffInMilliseconds = Date.now() - lastCommunicationDate.getTime();
      const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} horas atrás`;
      } else {
        const diffInDays = diffInHours / 24;
        return `${Math.floor(diffInDays)} días atrás`;
      }
    }
    return 'Sin comunicaciones';
  }

  getCommunicationClass(lead: Lead): string {
    if (lead.communications && lead.communications.length > 0) {
      const lastCommunicationDate = new Date(
        lead.communications[lead.communications.length - 1].date
      );
      const diffInMilliseconds = Date.now() - lastCommunicationDate.getTime();
      const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);

      if (diffInDays <= 2) {
        return 'within-two-days'; // Green if within 2 days
      } else if (diffInDays <= 4) {
        return 'within-four-days'; // Light Green if within 4 days
      } else if (diffInDays <= 7) {
        return 'within-seven-days'; // Yellow if within 7 days
      } else if (diffInDays <= 14) {
        return 'within-fourteen-days'; // Orange if within 14 days
      } else {
        return 'more-than-fourteen-days'; // Red if more than 14 days
      }
    }
    return 'no-communications'; // Transparent if no communications
  }

  openConfirmDialog(lead: Lead): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Estas seguro de eliminar esta cliente potencial?',
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
    this.router.navigate(['sales/leads/add']);
  }

  seeLead(lead: Lead) {
    this.router.navigate([`sales/leads/${lead.id}`]);
  }

  editLead(lead: Lead) {
    this.router.navigate([`sales/leads/edit/${lead.id}`]);
  }

  deleteLead(lead: Lead) {}
}
