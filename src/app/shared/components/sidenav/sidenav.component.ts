import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  computed,
  inject,
} from '@angular/core';
import { navbarData } from './nav-data';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

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
      transition(':leave', [
        style({ height: '*' }),
        animate('350ms ease-in'),
      ]),
    ])
  ],
})
export class SidenavComponent implements OnInit {
  @Output() onToggleSideNav = new EventEmitter<SideNavToggle>();
  collapsed = true;
  sidenavOpen = true;
  screenWidth = 0;
  navData = navbarData;
  user = this.authService.currentUser();

  constructor(
  private router: Router, 
  private route: ActivatedRoute,
  private authService: AuthService,
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.screenWidth = window.innerWidth;
    this.collapsed = this.screenWidth <= 768 ? true : false;
  }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
    this.collapsed = false; // like why???
    this.collapsed = this.screenWidth <= 768 ? true : false; //so stupid but it works
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.navData.forEach((item) => (item.isExpanded = false));
      });
  }

  handleClick(data: any) {
    data.isExpanded = !data.isExpanded;
    if (!data.subRoutes) {
      console.log('Navigating to:', data.routeLink); // Add this line
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

  closeSidenav(): void {
    this.collapsed = false;
    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  toggleDesktopSidenav(): void {
    this.sidenavOpen = !this.sidenavOpen;
    // Set isExpanded to false for all items
    this.navData.forEach(item => item.isExpanded = false);
  }

  openDesktopSidenav(): void {
    this.sidenavOpen = true;
  
  }

  isSubrouteActive(subRoutes: { routeLink: string }[]): boolean {
    return subRoutes.some(subRoute => this.route.snapshot.firstChild && this.router.isActive(this.route.snapshot.firstChild.url.join('/'), false));
  }

  isAllowed(allowedRoles: string[]): boolean {
    const userRole = this.authService.getCurrentUserRoles();
    return allowedRoles.some((role) => userRole.includes(role));
  }
}
