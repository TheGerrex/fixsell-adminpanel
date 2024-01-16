import { Component, computed, effect, inject } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { AuthStatus } from './auth/interfaces';
import { Router } from '@angular/router';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'admin panel';

  private AuthService = inject(AuthService);
  private router = inject(Router);
  
  public finishedAuthCheck = computed<boolean>( () => {
  
    if(this.AuthService.authStatus() === AuthStatus.checking) {

    return false;
  }
  
  return true; 

});

isSideNavCollapsed = true;
screenWidth = 0;

onToggleSideNav(data: SideNavToggle): void {
  this.screenWidth = data.screenWidth;
  this.isSideNavCollapsed = data.collapsed;
}

  

public authStatusChangedEffect = effect( () => {
  
  switch(this.AuthService.authStatus()) {
    case AuthStatus.checking:
      return;

    case AuthStatus.authenticated:
      this.router.navigateByUrl('/dashboard');
      return;


    case AuthStatus.notAuthenticated:
      this.router.navigateByUrl('/auth/login');
      return;
  }

  this.AuthService.authStatus()
});


}
