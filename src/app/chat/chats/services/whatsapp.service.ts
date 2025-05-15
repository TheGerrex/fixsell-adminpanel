import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, forkJoin, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface WhatsAppChat {
  phone_number: string;
  last_message: string;
  last_activity: string;
  interaction_count: number;
  created_at: string;
  is_ticket_flow: boolean;
  service_type: string | null;
  thread_id: string | null;
  step: string | null;
  ticket_id: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class WhatsAppService {
  // Use the full backend URL instead of relative path
  private apiUrl = environment.chatbotUrl;

  constructor(private http: HttpClient) {}

  /**
   * Fetches active WhatsApp chats (in-memory)
   */
  getActiveWhatsAppChats(): Observable<WhatsAppChat[]> {
    return this.http
      .get<WhatsAppChat[]>(`${this.apiUrl}/api/webhook/whatsapp/chats`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching active WhatsApp chats:', error);
          return of([]);
        }),
      );
  }

  /**
   * Fetches all WhatsApp chats from database history
   */
  getAllWhatsAppChats(): Observable<WhatsAppChat[]> {
    return this.http
      .get<WhatsAppChat[]>(`${this.apiUrl}/api/webhook/whatsapp/chats/all`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching all WhatsApp chats:', error);
          return of([]);
        }),
      );
  }

  /**
   * Gets combined chat history (both active and database chats)
   */
  getCombinedWhatsAppChats(): Observable<WhatsAppChat[]> {
    return forkJoin([
      this.getActiveWhatsAppChats(),
      this.getAllWhatsAppChats(),
    ]).pipe(
      map(([activeChats, allChats]) => {
        // Combine and deduplicate chats by phone number
        const phoneNumbers = new Set();
        const combinedChats: WhatsAppChat[] = [];

        // Active chats have priority
        activeChats.forEach((chat) => {
          phoneNumbers.add(chat.phone_number);
          combinedChats.push(chat);
        });

        // Add database chats that aren't already included
        allChats.forEach((chat) => {
          if (!phoneNumbers.has(chat.phone_number)) {
            combinedChats.push(chat);
            phoneNumbers.add(chat.phone_number);
          }
        });

        // Sort by last_activity (most recent first)
        return combinedChats.sort(
          (a, b) =>
            new Date(b.last_activity).getTime() -
            new Date(a.last_activity).getTime(),
        );
      }),
      catchError((error) => {
        console.error('Error fetching combined chats:', error);
        return of([]);
      }),
    );
  }
}
