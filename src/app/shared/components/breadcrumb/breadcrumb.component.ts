import { Component, NgZone, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, map, switchMap } from 'rxjs/operators';
import { SharedService } from '../../services/shared.service';
import { PrinterService } from 'src/app/website/printer/services/printer.service';
import { Observable, forkJoin, of } from 'rxjs';
import { ItemNameService } from './breadcrumb.service';

type Breadcrumb = { label: string; url: string };

@Component({
  selector: 'app-breadcrumb',
  template: `
    <nav>
      <div
        class="breadcrumb-route"
        *ngFor="let breadcrumb of breadcrumbs; let i = index"
      >
        <a
          [routerLink]="breadcrumb.url"
          [class.active]="i === breadcrumbs.length - 1"
          >{{ breadcrumb.label }}</a
        >
        <span *ngIf="i < breadcrumbs.length - 1">/</span>
      </div>
    </nav>
  `,
  styles: [
    `
      nav {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 16px;
        align-items: center;
        height: auto;
        background-color: #fff;
        padding: 8px 16px;
        border-radius: 4px;
        border: 1px solid #d1d5db;
      }
      @media (max-width: 768px) {
        nav {
          margin-bottom: 8px;
        }
      }
      .breadcrumb-route {
        // background-color: #f9fafb;
      }
      a {
        color: #1f2937;
        text-decoration: none;
      }
      a:hover {
        // color: #3b82f6;
        text-decoration: underline;
      }

      a.active {
        color: #3b82f6;
        font-weight: 500;
      }
    `,
  ],
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];
  printerModel: string = '';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ngZone: NgZone,
    private sharedService: SharedService,
    private printerService: PrinterService,
    private itemNameService: ItemNameService
  ) {}

  ngOnInit(): void {
    const labelMap: { [key: string]: string } = {
      printers: 'Multifuncionales',
      consumibles: 'Consumibles',
      packages: 'Paquetes de Renta',
      deals: 'Promociones',
      edit: 'Editar',
      create: 'Crear',
      user: 'Usuarios',
      // Add more mappings here if needed
    };

    const createBreadcrumbs = (url: string): Observable<Breadcrumb[]> => {
      const urlSegments = url.split('/');
      const labelSegments = [...urlSegments].slice(2);
      const breadcrumbObservables: Observable<Breadcrumb>[] = [];
      for (let i = 0; i < labelSegments.length; i++) {
        if (
          labelSegments[i].match(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          )
        ) {
          breadcrumbObservables[i] = this.itemNameService
            .getItemName(urlSegments[2], labelSegments[i]) //maybe add functionality in case if different url.. e.g. /website/printer or /users or /website/consumibles/printers
            .pipe(
              map((name) => {
                return {
                  label: labelMap[name] || name,
                  url: `/${urlSegments.slice(0, i + 3).join('/')}`,
                };
              })
            );
        } else {
          breadcrumbObservables[i] = of({
            label: labelMap[labelSegments[i]] || labelSegments[i],
            url: `/${urlSegments.slice(0, i + 3).join('/')}`,
          });
        }
      }
      return forkJoin(breadcrumbObservables);
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
          createBreadcrumbs(event.urlAfterRedirects)
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
}
