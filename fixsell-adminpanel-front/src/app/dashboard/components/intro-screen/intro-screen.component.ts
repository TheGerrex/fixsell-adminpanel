import { Component, computed, inject } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-intro-screen',
  templateUrl: './intro-screen.component.html',
  styleUrls: ['./intro-screen.component.scss'],
})
export class IntroScreenComponent {
  private authService = inject(AuthService);
  public user = computed(() => this.authService.currentUser());

  ngOnInit(): void {}
}
