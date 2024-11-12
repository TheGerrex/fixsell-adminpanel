import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { EventService } from '../../../events/services/event.service';
import { EventData } from '../../../interfaces/event.interface';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
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
    private router: Router,
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
   * Navigates to the Create Event page.
   */
  navigateToCreateEvent(): void {
    this.router.navigate(['website/events/create']);
  }

  /**
   * Navigates to the Edit Event page.
   * @param event The event to be edited.
   */
  editEvent(event: EventData) {
    // Update this method to navigate to an edit page if you have one
    this.router.navigate(['/events/edit', event.id]);
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
