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
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.scss'],
})
export class TicketsListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  dataSource = new MatTableDataSource<Ticket>();
  filterValue = '';
  searchTerm = '';
  TicketData: Ticket[] = [];
  isLoadingData = false;
  displayedColumns: string[] = [
    'Client',
    'Title',
    'Type',
    'status',
    'priority',
    'updatedDate', //time since last update
    // 'createdDate', //time since created
    'action',
  ];

  priorityMapping: { [key: string]: number } = {
    high: 3,
    medium: 2,
    low: 1,
  };

  statusTranslations: { [key in Status]: string } = {
    [Status.OPEN]: 'ABIERTO',
    [Status.IN_PROGRESS]: 'EN PROGRESO',
    [Status.WITHOUT_RESOLUTION]: 'SIN RESOLUCIÓN',
    [Status.COMPLETED]: 'COMPLETADO',
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
      case 'ABIERTO':
        return 'status-open';
      case 'EN PROGRESO':
        return 'status-in-progress';
      case 'SIN RESOLUCIÓN':
        return 'status-without-resolution';
      case 'COMPLETADO':
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
    private router: Router,
    private ticketsService: TicketsService,
    private authService: AuthService,
    private toastService: ToastService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const status = params['status'];
      // Use the status to filter the tickets
      this.loadData(status);
    });
    const canViewAllTickets =
      this.authService.hasPermission('canViewAllTickets');
    if (canViewAllTickets) {
      // If the user can view all tickets, ensure all relevant columns are displayed
      this.displayedColumns = [
        'Client',
        'Title',
        'Type',
        'status',
        'priority',
        'updatedDate',
        // 'createdDate',
        'action',
      ];
    } else {
      // If the user can only view their own tickets, adjust columns accordingly
      this.displayedColumns = [
        'Client',
        'Title',
        'Type',
        'status',
        'priority',
        'updatedDate',
        // 'createdDate',
        'action',
      ];
    }

    this.dataSource.sort = this.sort;
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      console.log(`Sorting by ${sortHeaderId}`);
      if (sortHeaderId === 'priority') {
        return this.priorityMapping[data.priority];
      } else {
        return data[sortHeaderId as keyof Ticket];
      }
    };
  }

  loadData(statuses?: string) {
    this.isLoadingData = true;
    let ticketsObservable: Observable<Ticket[]>;
    const user = this.authService.getCurrentUser();
    const canViewAllTickets =
      this.authService.hasPermission('canViewAllTickets');

    if (canViewAllTickets) {
      ticketsObservable = this.ticketsService.getAllTickets();
      console.log('loadData - User can view all tickets:', ticketsObservable);
    } else {
      if (user && user.id) {
        ticketsObservable = this.ticketsService.getAllTicketsForUser(user.id);
        console.log('loadData - User can view own tickets:', ticketsObservable);
      } else {
        // Handle the case where there is no current user
        console.error('No current user');
        this.isLoadingData = false;
        return;
      }
    }

    ticketsObservable.subscribe(
      (tickets) => {
        console.log('Received tickets list:', tickets);
        if (statuses !== undefined) {
          const statusArray = statuses.split(','); // Split the statuses string into an array
          tickets = tickets.filter((ticket) =>
            statusArray.includes(ticket.status),
          );
        }
        tickets = tickets.map((ticket) => {
          ticket.updatedDate = new Date(ticket.updatedDate);
          return ticket;
        });
        this.TicketData = tickets;
        this.dataSource = new MatTableDataSource(tickets);
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addTicket() {
    console.log('Add ticket');
    this.router.navigate(['/support/tickets/create']);
  }

  seeTicket(ticket: Ticket) {
    console.log('See ticket:', ticket);
    console.log('routing to: /support/tickets/' + ticket.id);
    this.router.navigate(['/support/tickets/' + ticket.id]);
  }

  editTicket(ticket: Ticket) {
    console.log('Edit ticket:', ticket);
    console.log('routing to: /support/tickets/' + ticket.id + '/edit');
    this.router.navigate(['/support/tickets/' + ticket.id + '/edit']);
  }

  openConfirmDialog(ticket: Ticket): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: 'Estas seguro de eliminar este ticket?',
      message: 'El ticket será eliminado permanentemente.',
      buttonText: {
        ok: 'Eliminar',
        cancel: 'Cancelar',
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (ticket.id) {
          this.deleteTicket(ticket);
        }
      }
    });
  }

  deleteTicket(ticket: Ticket) {
    if (ticket.id) {
      this.ticketsService.deleteTicket(ticket.id).subscribe(
        (response) => {
          this.TicketData = this.TicketData.filter((t) => t.id !== ticket.id);
          this.dataSource.data = this.TicketData;
          this.toastService.showSuccess(
            'Ticket eliminado con éxito',
            'Aceptar',
          );
        },
        (error) => {
          this.toastService.showError(error.error.message, 'Cerrar');
        },
      );
    }
  }
}
