import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { environment } from 'src/environments/environment'; // Import environment

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private apiUrl = `${environment.baseUrl}/chatbot`; // Use environment's baseUrl

  constructor(private http: HttpClient) {}

  getConnectedClients(): Observable<{ id: string; roomName: string }[]> {
    return this.http
      .get<{ id: string; roomName: string }[]>(
        `${this.apiUrl}/connected-clients`,
      )
      .pipe(
        // tap((clients) => console.log('Received clients:', clients)),
        catchError((error) => {
          console.error('Error fetching connected clients:', error);
          return [];
        }),
      );
  }
}
