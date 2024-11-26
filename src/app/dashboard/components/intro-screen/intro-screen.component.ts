// intro-screen.component.ts
import { Component, OnInit, computed, inject } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/shared/services/toast.service';
interface Currency {
  id: string;
  name: string;
  exchangeRate: string;
  lastUpdated: string;
}

@Component({
  selector: 'app-intro-screen',
  templateUrl: './intro-screen.component.html',
  styleUrls: ['./intro-screen.component.scss'],
})
export class IntroScreenComponent implements OnInit {
  printerCount: number = 0;
  userCount: number = 0;
  currencyData: Currency[] = [];

  private authService = inject(AuthService);
  public user = computed(() => this.authService.currentUser());

  constructor(private http: HttpClient, private toastService: ToastService) {}
  ngOnInit(): void {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + (localStorage.getItem('token') || ''),
    });

    this.http
      .get(`${environment.baseUrl}/auth`, { headers })
      .subscribe((data: any) => (this.userCount = data.length));

    this.http
      .get(`${environment.baseUrl}/printers`)
      .subscribe((data: any) => (this.printerCount = data.length));

    this.http.get<Currency[]>(`${environment.baseUrl}/currency/`).subscribe(
      (data) => {
        this.currencyData = data;
      },
      (error) => {
        console.error('Error fetching currency data:', error);
      },
    );
  }

  // !TODO
  // move to a service
  /**
   * Fetches the currency data from the backend.
   */
  fetchCurrencyData(): void {
    this.http.get<Currency[]>(`${environment.baseUrl}/currency/`).subscribe(
      (data) => {
        this.currencyData = data;
      },
      (error) => {
        console.error('Error fetching currency data:', error);
      },
    );
  }
  /**
   * Updates the currency exchange rates by calling the backend update endpoint.
   */
  updateCurrency(): void {
    this.http.get(`${environment.baseUrl}/currency/update`).subscribe(
      (response) => {
        console.log('Exchange rates updated successfully:', response);
        // Now fetch the updated currency data
        this.fetchCurrencyData();
        this.toastService.showSuccess(
          'Tipos de cambio actualizados con éxito',
          'Cerrar',
        );
      },
      (error) => {
        console.error('Error updating currency data:', error);
        this.toastService.showError(
          'Error al actualizar los datos de la moneda',
          'Cerrar',
        );
      },
    );
  }
}
