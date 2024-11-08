import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { EventService } from '../../../events/services/event.service';
import { EventData } from '../../../interfaces/event.interface';
import { ToastService } from 'src/app/shared/services/toast.service';
import { EventCreateDialogComponent } from '../../components/event-create-dialog/event-create-dialog.component';
import { EventEditDialogComponent } from '../../components/event-edit-dialog/event-edit-dialog.component';
@Component({
  selector: 'app-event-dashboard',
  templateUrl: './event-dashboard.component.html',
  styleUrls: ['./event-dashboard.component.scss'],
})
export class EventDashboardComponent implements OnInit {
  events: EventData[] = [];
  dataSource = new MatTableDataSource<EventData>();
  displayedColumns: string[] = [
    'image',
    'title',
    'startDate',
    'endDate',
    'description',
    'action',
  ];
  searchTerm: string = '';
  isLoadingData = false;
  imagePreviewUrl: string | null = null;
  imagePreviewPosition = { x: 0, y: 0 };

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private eventService: EventService,
    private toastService: ToastService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadEvents() {
    this.isLoadingData = true;
    this.eventService.findAll().subscribe(
      (events) => {
        this.events = events;
        this.dataSource.data = this.events;
        this.isLoadingData = false;
      },
      (error) => {
        console.error('Error loading events:', error);
        this.isLoadingData = false;
      },
    );
  }

  applyFilter(event: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Opens the create event dialog.
   */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(EventCreateDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.events.push(result);
        this.dataSource.data = this.events;
      }
    });
  }

  /**
   * Opens the edit event dialog.
   * @param event The event to be edited.
   */
  openEditDialog(event: EventData): void {
    const dialogRef = this.dialog.open(EventEditDialogComponent, {
      data: { id: event.id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.events.forEach((e, i) => {
          if (e.id === result.id) {
            this.events[i] = result;
          }
        });
        this.dataSource.data = this.events;
      }
    });
  }

  editEvent(event: EventData) {
    this.openEditDialog(event);
  }

  deleteEvent(event: EventData) {
    const index = this.events.findIndex((e) => e === event);
    if (index >= 0) {
      this.events.splice(index, 1);
      this.dataSource.data = this.events;
    }

    // Delete the event from the server
    this.eventService.delete(event.id).subscribe(
      () => {
        this.toastService.showSuccess('Evento eliminado con éxito', 'Cerrar');
      },
      (error) => {
        console.error('Error deleting event:', error);
        this.toastService.showError('Error eliminando el evento', 'Cerrar');
      },
    );
  }

  showImagePreview(event: MouseEvent, imageUrl: string) {
    this.imagePreviewUrl = imageUrl;
    this.moveImagePreview(event);
  }

  moveImagePreview(event: MouseEvent) {
    this.imagePreviewPosition = {
      x: event.clientX + 15,
      y: event.clientY + 15,
    };
  }

  hideImagePreview() {
    this.imagePreviewUrl = null;
  }
}
