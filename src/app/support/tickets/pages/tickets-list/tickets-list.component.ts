import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
import { TableColumn } from 'src/app/shared/components/data-table/data-table.component';

@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.scss'],
})
export class TicketsListComponent implements OnInit {
  TicketData: Ticket[] = [];
  isLoadingData = false;
  searchTerm = '';

  displayedColumns: string[] = [
    'clientName',
    'title',
    'type',
    'status',
    'priority',
    'updatedDate',
    'action',
  ];

  columns: TableColumn[] = [
    {
      name: 'clientName',
      label: 'Cliente',
      sortable: true,
    },
    {
      name: 'title',
      label: 'Tema',
      sortable: true,
    },
    {
      name: 'type',
      label: 'Tipo',
      sortable: true,
      formatter: (value: any) => {
        // Handle ticket type formatting
        switch (value) {
          case 'remote':
            return 'Remoto';
          case 'onsite':
            return 'En sitio';
          case 'phone':
            return 'Teléfono';
          case 'email':
            return 'Email';
          default:
            return value;
        }
      },
    },
    {
      name: 'status',
      label: 'Estatus',
      sortable: true,
      formatter: (value: any, row: Ticket) => ({
        html: true,
        content: `<div class="ticket-status ${this.getStatusClass(row)}">
                    ${this.getStatusTranslation(row.status)}
                  </div>`,
      }),
    },
    {
      name: 'priority',
      label: 'Prioridad',
      sortable: true,
      formatter: (value: any, row: Ticket) => {
        const priorityClass = this.getPriorityClass(row);
        let flagsHtml = '';

        switch (row.priority) {
          case 'high':
            flagsHtml = `
          <div class="priority-flags-container high-priority">
            <i class="material-icons ${priorityClass}">flag</i>
            <i class="material-icons ${priorityClass}">flag</i>
            <i class="material-icons ${priorityClass}">flag</i>
          </div>
        `;
            break;
          case 'medium':
            flagsHtml = `
          <div class="priority-flags-container medium-priority">
            <i class="material-icons ${priorityClass}">flag</i>
            <i class="material-icons ${priorityClass}">flag</i>
            <i class="material-icons ${priorityClass}">outlined_flag</i>
          </div>
        `;
            break;
          case 'low':
          default:
            flagsHtml = `
          <div class="priority-flags-container low-priority">
            <i class="material-icons ${priorityClass}">flag</i>
            <i class="material-icons ${priorityClass}">outlined_flag</i>
            <i class="material-icons ${priorityClass}">outlined_flag</i>
          </div>
        `;
        }

        return {
          html: true,
          content: flagsHtml,
        };
      },
    },
    {
      name: 'updatedDate',
      label: 'Ultima Actualización',
      sortable: true,
      formatter: (value: any) => {
        if (!value) return '';
        const date = new Date(value);
        return date.toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        });
      },
    },
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
      this.loadData(status);
    });

    // Adjust columns based on permissions
    const canViewAllTickets =
      this.authService.hasPermission('canViewAllTickets');
    if (canViewAllTickets) {
      this.displayedColumns = [
        'clientName',
        'title',
        'type',
        'status',
        'priority',
        'updatedDate',
        'action',
      ];
    } else {
      this.displayedColumns = [
        'clientName',
        'title',
        'type',
        'status',
        'priority',
        'updatedDate',
        'action',
      ];
    }
  }

  getStatusTranslation(status: Status): string {
    return this.statusTranslations[status];
  }

  getPriorityTranslation(priority: Priority): string {
    return this.priorityTranslations[priority];
  }

  getStatusClass(ticket: Ticket): string {
    switch (ticket.status) {
      case Status.OPEN:
        return 'status-open';
      case Status.IN_PROGRESS:
        return 'status-in-progress';
      case Status.WITHOUT_RESOLUTION:
        return 'status-without-resolution';
      case Status.COMPLETED:
        return 'status-completed';
      default:
        return '';
    }
  }

  getPriorityClass(ticket: Ticket): string {
    switch (ticket.priority) {
      case Priority.LOW:
        return 'priority-low';
      case Priority.MEDIUM:
        return 'priority-medium';
      case Priority.HIGH:
        return 'priority-high';
      default:
        return '';
    }
  }

  loadData(statuses?: string) {
    this.isLoadingData = true;
    let ticketsObservable: Observable<Ticket[]>;
    const user = this.authService.getCurrentUser();
    const canViewAllTickets =
      this.authService.hasPermission('canViewAllTickets');

    if (canViewAllTickets) {
      ticketsObservable = this.ticketsService.getAllTickets();
    } else {
      if (user && user.id) {
        ticketsObservable = this.ticketsService.getAllTicketsForUser(user.id);
      } else {
        console.error('No current user');
        this.isLoadingData = false;
        return;
      }
    }

    ticketsObservable.subscribe(
      (tickets) => {
        if (statuses !== undefined) {
          const statusArray = statuses.split(',');
          tickets = tickets.filter((ticket) =>
            statusArray.includes(ticket.status),
          );
        }

        // Convert string dates to Date objects for sorting
        // Using a default date instead of null to match Ticket interface
        this.TicketData = tickets.map((ticket) => ({
          ...ticket,
          updatedDate: ticket.updatedDate
            ? new Date(ticket.updatedDate)
            : new Date(),
        }));

        this.isLoadingData = false;
      },
      (error) => {
        console.error('Error loading tickets:', error);
        this.isLoadingData = false;
      },
    );
  }

  addTicket() {
    this.router.navigate(['/support/tickets/create']);
  }

  seeTicket(ticket: Ticket) {
    this.router.navigate(['/support/tickets/' + ticket.id]);
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
        this.deleteTicket(ticket);
      }
    });
  }

  deleteTicket(ticket: Ticket) {
    if (ticket.id) {
      this.ticketsService.deleteTicket(ticket.id).subscribe(
        (response) => {
          this.TicketData = this.TicketData.filter((t) => t.id !== ticket.id);
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

  // Method for DataTableComponent to handle row click
  onRowClick(ticket: Ticket): void {
    this.seeTicket(ticket);
  }
}
