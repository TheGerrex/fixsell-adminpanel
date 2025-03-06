import { Component, OnInit } from '@angular/core';
import { Log } from '../../../interfaces/log.interface';
import { LogsService } from '../../services/logs.service';
import { TableColumn } from 'src/app/shared/components/data-table/data-table.component';

@Component({
  selector: 'app-logs-list',
  templateUrl: './logs-list.component.html',
  styleUrls: ['./logs-list.component.scss'],
})
export class LogsListComponent implements OnInit {
  logs: Log[] = [];
  isLoading = false;

  displayedColumns: string[] = [
    'id',
    'userName',
    'action',
    'entity',
    'entityId',
    'method',
    'url',
    'changes',
    'timestamp',
    'ip',
  ];

  columns: TableColumn[] = [
    {
      name: 'id',
      label: 'ID',
      sortable: true,
    },
    {
      name: 'userName',
      label: 'User Name',
      sortable: true,
    },
    {
      name: 'action',
      label: 'Action',
      sortable: true,
    },
    {
      name: 'entity',
      label: 'Entity',
      sortable: true,
    },
    {
      name: 'entityId',
      label: 'Entity ID',
      sortable: true,
    },
    {
      name: 'method',
      label: 'Method',
      sortable: true,
      formatter: (value: string) => {
        // Optionally add styling for HTTP methods
        const methodClasses: { [key: string]: string } = {
          GET: 'method-get',
          POST: 'method-post',
          PUT: 'method-put',
          DELETE: 'method-delete',
          PATCH: 'method-patch',
        };

        const className = methodClasses[value] || '';

        return {
          html: true,
          content: `<span class="method-badge ${className}">${value}</span>`,
        };
      },
    },
    {
      name: 'url',
      label: 'URL',
      sortable: true,
    },
    {
      name: 'changes',
      label: 'Changes',
      sortable: false,
      formatter: (value: any) => {
        if (!value) return '';

        // Attempt to stringify the changes if they're an object
        try {
          if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
          }
          return value;
        } catch (e) {
          return value?.toString() || '';
        }
      },
    },
    {
      name: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      formatter: (value: string) => {
        if (!value) return '';

        // Format the timestamp in a more readable way
        const date = new Date(value);
        return date.toLocaleString('es-MX', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
        });
      },
    },
    {
      name: 'ip',
      label: 'IP',
      sortable: true,
    },
  ];

  constructor(private logsService: LogsService) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.isLoading = true;
    const token = localStorage.getItem('token') || '';

    this.logsService.getAllLogs(token).subscribe({
      next: (logs) => {
        this.logs = logs;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading logs:', error);
        this.isLoading = false;
      },
    });
  }
}
