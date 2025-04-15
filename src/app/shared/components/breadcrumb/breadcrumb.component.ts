import { Component, NgZone, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { SharedService } from '../../services/shared.service';
import { PrinterService } from 'src/app/website/printer/services/printer.service';
import { Observable, forkJoin, of } from 'rxjs';
import { ItemNameService } from './breadcrumb.service';

type Breadcrumb = { label: string; url: string };

@Component({
  selector: 'app-breadcrumb',
  template: `
    <nav [class.hidden]="isInitialPage()">
      <div class="breadcrumb-container">
        <ng-container *ngFor="let breadcrumb of breadcrumbs; let i = index">
          <div class="breadcrumb-route">
            <a
              [routerLink]="breadcrumb.url"
(click)="onBreadcrumbClick(breadcrumb.url)"
              [class.active]="i === breadcrumbs.length - 1"
            >
              {{ breadcrumb.label }}
            </a>
          </div>
          <span class="divider" *ngIf="i < breadcrumbs.length - 1">
            <mat-icon>chevron_right</mat-icon>
          </span>
        </ng-container>
      </div>
    </nav>
  `,
  styles: [
    `      .hidden {
        display: none;
      }
      .breadcrumb-container {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
      }
      a {
        text-decoration: none;
        font-optical-sizing: auto;
        font-weight: 400;
        font-style: normal;
        color: #64748b;
      }
      a:hover {
        color: #1f2937;
        text-decoration: underline;
      }

      a.active {
        color: #3b82f6;
        font-weight: 500;
      }

      .divider {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        width: min-content;
        mat-icon {
          height: 18px;
          width: 18px;
          font-size: 18px;
          color: #64748b;
        }
      }   
    `,
  ],
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];
  printerModel: string = '';

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private sharedService: SharedService,
    private itemNameService: ItemNameService
  ) { }

  ngOnInit(): void {
    const labelMap: { [key: string]: string } = {
      printers: 'Multifuncionales',
      consumibles: 'Consumibles',
      packages: 'Paquetes de Renta',
      deals: 'Promociones',
      edit: 'Editar',
      create: 'Crear',
      user: 'Usuarios',
      website: 'Página Web',
      printer: 'Multifuncional',
      config: 'Configuración',
      tickets: 'Tickets',
      leads: 'Prospectos',
      sales: 'Ventas',
      clients: 'Clientes',
      leads_communication: 'Comunicación',
      leads_list: 'Listado de Prospectos',
      list: 'Listado',
      communication: 'Comunicación',
      // Add more mappings here if needed
    };

    const createBreadcrumbs = (url: string): Observable<Breadcrumb[]> => {
      const [path, queryParams] = url.split('?');
      const urlSegments = path.split('/').filter((segment) => segment); // Remove empty segments
      const breadcrumbObservables: Observable<Breadcrumb>[] = [];

      // Only process the last two segments for labels
      const relevantSegments = urlSegments.slice(-2);

      for (let i = 0; i < relevantSegments.length; i++) {
        if (
          relevantSegments[i].match(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          )
        ) {
          // Find the index of the UUID in the full urlSegments array
          const uuidIndex = urlSegments.indexOf(relevantSegments[i]);
          const type = urlSegments[uuidIndex - 1]; // Get the segment before the UUID
          const uuid = relevantSegments[i]; // Isolate the UUID
          console.log('Detected UUID:', uuid, 'Type:', type); // Debug log

          breadcrumbObservables.push(
            this.itemNameService.getItemName(type, uuid).pipe(
              map((name) => {
                return {
                  label: name || 'Unknown',
                  url: `/${urlSegments.slice(0, uuidIndex + 1).join('/')}`, // Use the full path for the link
                };
              }),
              catchError((error) => {
                console.error('Error fetching item name:', error);
                return of({
                  label: 'Unknown',
                  url: `/${urlSegments.slice(0, uuidIndex + 1).join('/')}`, // Use the full path for the link
                });
              })
            )
          );
        } else {
          // Handle non-UUID segments
          let label = labelMap[relevantSegments[i]] || relevantSegments[i];
          const segmentIndex = urlSegments.indexOf(relevantSegments[i]);
          breadcrumbObservables.push(
            of({
              label: label,
              url: `/${urlSegments.slice(0, segmentIndex + 1).join('/')}`, // Use the full path for the link
            })
          );
        }
      }

      return forkJoin(breadcrumbObservables).pipe(
        map((breadcrumbs) => breadcrumbs)
      );
    };

    this.sharedService.currentPrinterModel.subscribe((model) => {
      this.printerModel = model;
      // Create breadcrumbs for the current route
      createBreadcrumbs(this.router.url).subscribe((breadcrumbs) => {
        this.breadcrumbs = breadcrumbs;
      });
    });

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        switchMap((event: NavigationEnd) =>
          createBreadcrumbs(event.urlAfterRedirects.split('?')[0])
        )
      )
      .subscribe((breadcrumbs) => {
        this.ngZone.run(() => {
          this.breadcrumbs = breadcrumbs;
        });
      });
  }

  buildBreadCrumb(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Array<{ label: string; url: string }> = []
  ): Array<{ label: string; url: string }> {
    let label =
      route.routeConfig && route.routeConfig.data
        ? route.routeConfig.data['breadcrumb']
        : '';
    let path =
      route.routeConfig && route.routeConfig.path ? route.routeConfig.path : '';

    // If the route is dynamic route such as ':id', replace it with actual parameter value
    const lastRoutePart = path.split('/').pop();
    const isDynamicRoute = lastRoutePart && lastRoutePart.startsWith(':');
    if (isDynamicRoute && !!route.snapshot) {
      const paramName = lastRoutePart.split(':')[1];
      path = path.replace(lastRoutePart, route.snapshot.params[paramName]);
      label = route.snapshot.params[paramName];
    }

    const nextUrl = path ? `${url}/${path}` : url;

    // Filter out the initial page breadcrumb
    if (nextUrl === '/website/printers') {
      return breadcrumbs;
    }

    const breadcrumb = {
      label: label,
      url: nextUrl,
    };
    const newBreadcrumbs = breadcrumb.label
      ? [...breadcrumbs, breadcrumb]
      : [...breadcrumbs];

    if (route.firstChild) {
      // If we are not on our current path yet,
      // there will be more children to look after, to build our breadcrumb
      return this.buildBreadCrumb(route.firstChild, nextUrl, newBreadcrumbs);
    }
    return newBreadcrumbs.reverse();
  }

  onBreadcrumbClick(url: string): void {
    console.log('Navigating to:', url);
    if (url === '//sales/leads/communication') {
      this.router.navigate(['/sales/leads']);
    } else {
      this.router.navigate([url]);
    }
  }

  isInitialPage(): boolean {
    const urlSegments = this.router.url.split('/').filter((segment) => segment); // Remove empty segments

    // List of known initial pages
    const initialPages = [
      'clients', // Single-segment initial page
      'website/printers', // Two-segment initial page
      'website/consumibles',
      'website/deals',
      'website/packages',
      'website/config',
      'sales/leads',
      'sales/clients',
      'support/tickets',
      'chat/chats',
      'users/user',
      'users/config',
    ];

    // Join the URL segments to form the current path
    const currentPath = urlSegments.join('/');

    // Check if the current path matches any of the initial pages
    return initialPages.includes(currentPath);
  }
}
