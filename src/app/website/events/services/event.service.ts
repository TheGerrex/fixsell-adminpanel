import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EventData } from '../../interfaces/event.interface';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = `${environment.baseUrl}/events`; // Use baseUrl for consistency

  constructor(private http: HttpClient) {}

  create(event: EventData): Observable<EventData> {
    return this.http.post<EventData>(this.apiUrl, event);
  }

  findAll(): Observable<EventData[]> {
    return this.http.get<EventData[]>(this.apiUrl);
  }

  findOne(id: string): Observable<EventData> {
    return this.http.get<EventData>(`${this.apiUrl}/${id}`);
  }

  update(eventId: string, eventData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${eventId}`, eventData);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
