import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  private baseURL = environment.chatbotUrl; // Using chatbotUrl from environment

  constructor(private http: HttpClient) {}

  /**
   * Fetches all active WhatsApp chats from the backend
   */
  getWhatsAppChats(): Observable<WhatsAppChat[]> {
    return this.http.get<WhatsAppChat[]>(
      `${this.baseURL}/api/webhook/whatsapp/chats`,
    );
  }

  /**
   * Get message history for a specific WhatsApp phone number
   */
  getWhatsAppChatHistory(phoneNumber: string): Observable<any> {
    return this.http.get(
      `${this.baseURL}/api/webhook/whatsapp/history/${phoneNumber}`,
    );
  }

  /**
   * Send a message to a WhatsApp user
   */
  sendWhatsAppMessage(phoneNumber: string, message: string): Observable<any> {
    return this.http.post(`${this.baseURL}/api/webhook/whatsapp/send`, {
      phone_number: phoneNumber,
      message: message,
    });
  }
}
