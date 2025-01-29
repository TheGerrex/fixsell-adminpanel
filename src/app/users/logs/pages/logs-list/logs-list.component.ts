import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Log } from '../../../interfaces/log.interface';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LogsService } from '../../services/logs.service';

@Component({
  selector: 'app-logs-list',
  templateUrl: './logs-list.component.html',
  styleUrls: ['./logs-list.component.scss'],
})
export class LogsListComponent implements OnInit, AfterViewInit {
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
  dataSource = new MatTableDataSource<Log>();
  token: string = '';
  isLoading = false;
  searchTerm = ''; // <-- Add this property

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private logsService: LogsService) {}

  ngOnInit() {
    this.isLoading = true;
    this.token = localStorage.getItem('token') || '';
    this.getAllLogsData();
    this.isLoading = false;
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterLogs(filterValue);
  }

  // Optionally refactor filtering into its own method
  filterLogs(value: string) {
    this.searchTerm = value.trim().toLowerCase();
    this.dataSource.filter = this.searchTerm;
  }

  getAllLogsData() {
    this.logsService.getAllLogs(this.token).subscribe({
      next: (logs) => {
        this.dataSource.data = logs;
      },
      error: () => {
        // Handle errors here
      },
    });
  }
}
