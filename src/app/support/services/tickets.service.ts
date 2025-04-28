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
    const url = `${environment.baseUrl}/tickets/assigned?userId=${userId}`;
    console.log('Fetching tickets with URL:', url);
    return this.http.get<Ticket[]>(url).pipe(
      map((ticketResponse) => {
        console.log('Received tickets:', ticketResponse);
        return ticketResponse;
      }),
    );
  }
  getTicketById(ticketId: string): Observable<Ticket> {
    return this.http
      .get<Ticket>(`${environment.baseUrl}/tickets/${ticketId}`)
      .pipe(map((ticketResponse) => ticketResponse));
  }

  updateTicket(
    id: number,
    ticket: Partial<Omit<Ticket, 'assigned'>> & { assigned?: string },
  ): Observable<Ticket> {
    console.log('update ticket function called');
    console.trace(); // This will output a stack trace
    console.log('updating ticket:', ticket);
    console.log('submitting ticket with id:', id);
    return this.http
      .patch<Ticket>(`${environment.baseUrl}/tickets/${id}`, ticket)
      .pipe(map((ticketResponse) => ticketResponse));
  }

  createTicket(ticket: Omit<Ticket, 'id'>): Observable<Ticket> {
    return this.http
      .post<Ticket>(`${environment.baseUrl}/tickets`, ticket)
      .pipe(map((ticketResponse) => ticketResponse));
  }

  deleteTicket(ticketId: number): Observable<any> {
    return this.http
      .delete(`${environment.baseUrl}/tickets/${ticketId}`, {
        responseType: 'text',
      })
      .pipe(
        tap({
          next: () => console.log('Ticket deleted successfully'),
          error: (error) => console.log('Error deleting ticket:', error),
        }),
      );
  }

  // send rating trigger to chatbot python backend
  // This function sends a rating prompt to the chatbot backend for a specific phone number.
  // Requirments for this function:
  // - The phone number should be a string.
  // - The function should return an Observable of any type.
  sendRatingPrompt(phone: string, ticketId: string): Observable<any> {
    return this.http.post(`${environment.chatbotUrl}/api/send-rating-prompt`, {
      phone_number: phone,
      ticket_id: ticketId,
    });
  }
}
