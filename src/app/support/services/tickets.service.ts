import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Ticket } from './../interfaces/tickets.interface';

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
  constructor(private http: HttpClient) {}

  getAllTickets(): Observable<Ticket[]> {
    return this.http
      .get<Ticket[]>(`${environment.baseUrl}/tickets`)
      .pipe(map((ticketResponse) => ticketResponse));
  }

  getAllTicketsByStatus(status: string): Observable<Ticket[]> {
    return this.http
      .get<Ticket[]>(`${environment.baseUrl}/tickets?status=${status}`)
      .pipe(map((ticketResponse) => ticketResponse));
  }

  getAllTicketsForUser(userId: string): Observable<Ticket[]> {
    return this.http
      .get<Ticket[]>(`${environment.baseUrl}/tickets?userId=${userId}`)
      .pipe(map((ticketResponse) => ticketResponse));
  }

  getTicketById(ticketId: string): Observable<Ticket> {
    return this.http
      .get<Ticket>(`${environment.baseUrl}/tickets/${ticketId}`)
      .pipe(map((ticketResponse) => ticketResponse));
  }
}
