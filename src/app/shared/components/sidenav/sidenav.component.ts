// sidenav.component.ts
import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  OnDestroy,
  Output,
  computed,
  inject,
} from '@angular/core';
import { navbarData } from './nav-data';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { NotificationService } from '../../services/notifications.service';
import { Subscription } from 'rxjs';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('350ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('350ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: '0px', minHeight: '0' }),
        animate('350ms ease-in'),
      ]),
      transition(':leave', [style({ height: '*' }), animate('350ms ease-in')]),
    ]),
  ],
})
export class SidenavComponent implements OnInit, OnDestroy {
  @Output() onToggleSideNav = new EventEmitter<SideNavToggle>();
  collapsed = true;
  sidenavOpen = true;
  screenWidth = 0;
  navData = navbarData;
  user = this.authService.currentUser();

  // Add notification count
  unreadNotificationsCount = 0;
  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.screenWidth = window.innerWidth;
    this.collapsed = this.screenWidth <= 768;
  }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
    this.collapsed = this.screenWidth <= 768;

    // Router event subscription
    this.subscriptions.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          this.navData.forEach((item) => (item.isExpanded = false));
        }),
    );

    // Initialize notification system
    this.notificationService.connectSocket();

    // Subscribe to unread notifications count
    this.subscriptions.add(
      this.notificationService.unreadCount$.subscribe((count) => {
        this.unreadNotificationsCount = count;
      }),
    );
  }

  handleClick(data: any) {
    data.isExpanded = !data.isExpanded;
    if (!data.subRoutes) {
      this.toggleCollapse();
    }
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  collapseMobileNav(): void {
    this.collapsed = true;
    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  closeSidenav(): void {
    this.collapsed = false;
    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  toggleDesktopSidenav(): void {
    this.sidenavOpen = !this.sidenavOpen;
    this.navData.forEach((item) => (item.isExpanded = false));
  }

  openDesktopSidenav(): void {
    this.sidenavOpen = true;
  }

  isSubrouteActive(subRoutes: { routeLink: string }[]): boolean {
    return subRoutes.some(
      (subRoute) =>
        this.route.snapshot.firstChild &&
        this.router.isActive(
          this.route.snapshot.firstChild.url.join('/'),
          false,
        ),
    );
  }

  isAllowed(allowedPermissions: string[]): boolean {
    if (allowedPermissions.length === 0) {
      return true; // Allow access if no permissions are required
    }
    const userPermissions = this.authService.getCurrentUserPermissions();
    return allowedPermissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }

  isRouteAllowed(route: any): boolean {
    if (this.isAllowed(route.allowedPermissions)) {
      return true;
    }
    if (route.subRoutes) {
      return route.subRoutes.some((subRoute: any) =>
        this.isRouteAllowed(subRoute),
      );
    }
    return false;
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.unsubscribe();
  }
}
