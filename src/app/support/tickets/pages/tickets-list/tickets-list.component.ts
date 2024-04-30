import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import {
  Ticket,
  Status,
  Priority,
} from 'src/app/support/interfaces/tickets.interface';
import { TicketsService } from '../../../services/tickets.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.scss'],
})
export class TicketsListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<Ticket>();
  filterValue = '';
  isAdmin = false;
  TicketData: Ticket[] = [];
  isLoadingData = false;
  displayedColumns: string[] = [
    'Title',
    'Client',
    'clientEmail',
    'clientPhone',
    'issue',
    'status',
    'priority',
    'updatedDate', //time since last update
    'createdDate', //time since created
    'action',
  ];
  statusTranslations: { [key in Status]: string } = {
    [Status.OPEN]: 'abierto',
    [Status.IN_PROGRESS]: 'en progreso',
    [Status.WITHOUT_RESOLUTION]: 'sin resolución',
    [Status.COMPLETED]: 'completado',
  };

  statusColors: { [key in Status]: string } = {
    [Status.OPEN]: 'blue',
    [Status.IN_PROGRESS]: 'yellow',
    [Status.WITHOUT_RESOLUTION]: 'orange',
    [Status.COMPLETED]: 'green',
  };

  priorityTranslations: { [key in Priority]: string } = {
    [Priority.LOW]: 'bajo',
    [Priority.MEDIUM]: 'medio',
    [Priority.HIGH]: 'alto',
  };

  priorityColors: { [key in Priority]: string } = {
    [Priority.LOW]: 'green',
    [Priority.MEDIUM]: 'orange',
    [Priority.HIGH]: 'red',
  };

  getStatusColor(status: Status): string {
    return this.statusColors[status];
  }

  getStatusTranslation(status: Status): string {
    return this.statusTranslations[status];
  }

  getPriorityColor(priority: Priority): string {
    return this.priorityColors[priority];
  }

  getPriorityTranslation(priority: Priority): string {
    return this.priorityTranslations[priority];
  }

  getStatusClass(ticket: Ticket): string {
    switch (this.getStatusTranslation(ticket.status)) {
      case 'abierto':
        return 'status-open';
      case 'en progreso':
        return 'status-in-progress';
      case 'sin resolución':
        return 'status-without-resolution';
      case 'completado':
        return 'status-completed';
      default:
        return '';
    }
  }

  getPriorityClass(ticket: Ticket): string {
    switch (this.getPriorityTranslation(ticket.priority)) {
      case 'bajo':
        return 'priority-low';
      case 'medio':
        return 'priority-medium';
      case 'alto':
        return 'priority-high';
      default:
        return '';
    }
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private ticketsService: TicketsService,
    private authService: AuthService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    Promise.resolve().then(() => this.loadData());
    const userRoles = this.authService.getCurrentUserRoles();
    this.isAdmin = userRoles.includes('admin');
    if (!this.isAdmin) {
      this.displayedColumns = [
        'Title',
        'Client',
        'clientEmail',
        'clientPhone',
        'issue',
        'status',
        'priority',
        'updatedDate',
        'createdDate',
      ];
    }
  }

  ngAfterViewInit() {
    // this.loadData();
  }

  loadData() {
    this.isLoadingData = true;
    this.ticketsService.getAllTickets().subscribe(
      (tickets) => {
        this.TicketData = tickets;
        this.dataSource = new MatTableDataSource(tickets);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.isLoadingData = false;
      },
      (error) => {
        console.error('Error:', error);
        this.isLoadingData = false;
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addTicket() {
    console.log('Add ticket');
  }

  seeTicket(ticket: Ticket) {
    console.log('See ticket:', ticket);
    console.log('routing to: /support/tickets/view/' + ticket.id);
    this.router.navigate(['/support/tickets/view/' + ticket.id]);
  }

  editTicket(ticket: Ticket) {
    console.log('Edit ticket:', ticket);
    console.log('routing to: /support/tickets/edit/' + ticket.id);
    this.router.navigate(['/support/tickets/edit/' + ticket.id]);
  }

  openConfirmDialog(ticket: Ticket): void {}

  deleteTicket(ticket: Ticket) {
    console.log('Delete ticket:', ticket.id);
  }
}
