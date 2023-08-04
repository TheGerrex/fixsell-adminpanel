import { Component, computed, inject } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { PrintersRegisterComponent } from '../../components/printers-register/printers-register.component';


@Component({
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent {


  brand: string = '';
  model: string = '';
  category: string = '';
  color: boolean = true;
  rentable: boolean = false;
  duplexUnit: boolean = false;
  powerConsumption: string = '';
  dimensions: string = '';
  printVelocity: Number = 0;
  maxPrintSize : string = '';
  maxPaperWeight: string = '';
  paperSizes: string = '';
  price: Number = 0.00; 
  applicableOS: string = '';
  description: string = '';
  img_url: string = '';

  private authService = inject( AuthService ); 
  public user = computed(() => this.authService.currentUser());


  onLogout() {
   
    this.authService.logout();
    console.log("clicked logout")
  }
}
