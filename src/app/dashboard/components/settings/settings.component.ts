import { Component, computed, inject } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  private authService = inject(AuthService);
  public user = computed(() => this.authService.currentUser());

  onLogout() {
    this.authService.logout();
    console.log('clicked logout');
  }

  editUser() {
    console.log('clicked edit user');
  }
}
