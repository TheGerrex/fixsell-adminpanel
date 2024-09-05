import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment'; // Import environment

@Injectable({
  providedIn: 'root',
})
export class ChatHistoryService {
  private baseURL = `${environment.baseUrl}`; // Use environment's baseUrl

  constructor(private http: HttpClient) {}

  getChatHistory(): Observable<any> {
    return this.http.get(`${this.baseURL}/chat-history`);
  }

  getChatHistoryById(roomId: string): Observable<any> {
    return this.http.get(`${this.baseURL}/chat-history/${roomId}`);
  }

  // Get latest message from specific room
  getLatestMessage(
    roomId: string,
  ): Observable<{ timestamp: string; message: string }> {
    return this.http.get<any[]>(`${this.baseURL}/chat-history/${roomId}`).pipe(
      map((messages) => {
        const latestMessage = messages
          .filter((message) => message.roomId === roomId)
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          )[0];
        return {
          timestamp: latestMessage.timestamp,
          message: latestMessage.message,
        };
      }),
    );
  }

  // Get the sender name from the roomId
  getSenderName(roomId: string): Observable<string> {
    return this.http.get<any[]>(`${this.baseURL}/chat-history/${roomId}`).pipe(
      map((messages) => {
        const senderMessage = messages.find(
          (message) => message.roomId === roomId && message.senderName !== null,
        );
        return senderMessage ? senderMessage.senderName : 'Anonymous';
      }),
    );
  }
}
