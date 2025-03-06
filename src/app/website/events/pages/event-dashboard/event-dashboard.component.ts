import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../../events/services/event.service';
import { EventData } from '../../../interfaces/event.interface';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TableColumn } from 'src/app/shared/components/data-table/data-table.component';

@Component({
  selector: 'app-event-edit-dashboard',
  templateUrl: './event-dashboard.component.html',
  styleUrls: ['./event-dashboard.component.scss'],
})
export class EventDashboardComponent implements OnInit, AfterViewInit {
  events: EventData[] = [];
  isLoadingData = false;
  imagePreviewUrl: string | null = null;
  imagePreviewPosition = { x: 0, y: 0 };

  displayedColumns: string[] = [
    'image',
    'title',
    'startDate',
    'endDate',
    'description',
    'action',
  ];

  columns: TableColumn[] = [
    {
      name: 'image',
      label: 'Imagen',
      formatter: (value: any, row: EventData) => ({
        html: true,
        content: `<img 
          src="${row.image}" 
          alt="Event Image" 
          width="100" 
          class="event-image" 
          data-image="${row.image}"
        />`,
      }),
    },
    {
      name: 'title',
      label: 'Título',
      sortable: true,
    },
    {
      name: 'startDate',
      label: 'Fecha de Inicio',
      sortable: true,
      formatter: (value: any, row: EventData) => {
        return new Date(row.startDate).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      },
    },
    {
      name: 'endDate',
      label: 'Fecha de Finalización',
      sortable: true,
      formatter: (value: any, row: EventData) => {
        return new Date(row.endDate).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      },
    },
    {
      name: 'description',
      label: 'Descripción',
    },
  ];

  @ViewChild('eventTable') eventTable!: ElementRef;

  constructor(
    private eventService: EventService,
    private toastService: ToastService,
    private router: Router,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  ngAfterViewInit() {
    // We'll set up the image preview event listeners after view init
    setTimeout(() => {
      this.setupImagePreviewListeners();
    }, 500); // Delay to ensure the table is rendered
  }

  setupImagePreviewListeners() {
    // Find all event images and add mouse event listeners
    const eventImages = document.querySelectorAll('.event-image');
    eventImages.forEach((img) => {
      this.renderer.listen(img, 'mouseover', (event) => {
        const imageUrl = (img as HTMLElement).getAttribute('data-image');
        if (imageUrl) {
          this.showImagePreview(event, imageUrl);
        }
      });

      this.renderer.listen(img, 'mousemove', (event) => {
        this.moveImagePreview(event);
      });

      this.renderer.listen(img, 'mouseleave', () => {
        this.hideImagePreview();
      });
    });
  }

  loadEvents() {
    this.isLoadingData = true;
    this.eventService.findAll().subscribe(
      (events) => {
        this.events = events;
        this.isLoadingData = false;

        // Add a small delay to set up image preview listeners after the table is rendered
        setTimeout(() => {
          this.setupImagePreviewListeners();
        }, 300);
      },
      (error) => {
        console.error('Error loading events:', error);
        this.isLoadingData = false;
      },
    );
  }

  navigateToCreateEvent(): void {
    this.router.navigate(['website/events/create']);
  }

  editEvent(event: EventData) {
    this.router.navigate(['website/events/edit', event.id]);
  }

  deleteEvent(event: EventData) {
    // Delete the event from the server
    this.eventService.delete(event.id).subscribe(
      () => {
        this.toastService.showSuccess('Evento eliminado con éxito', 'Cerrar');
        // Reload events data
        this.loadEvents();
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
