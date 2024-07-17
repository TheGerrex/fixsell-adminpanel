import { Component, OnInit, OnDestroy } from '@angular/core';
import { Manager, Socket } from 'socket.io-client';
import {
  connectToServerAsAdmin,
  addListeners,
  connectToServerAsUser,
} from '../../services/chat.service';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-chats-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chats-list.component.html',
  styleUrls: ['./chats-list.component.scss'],
})
export class ChatsListComponent implements OnInit, OnDestroy {
  private socket: Socket | undefined;
  currentRoomName: string = ''; // Add this line
  currentState: string = ''; // Add this line
  chatHistory: any[] = [];
  clients: { id: string; roomName: string }[] = [];
  private clientsSubscription: Subscription | undefined;
  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.currentRoomName = this.getRoomNameFromCookies() || '';
    this.currentState = this.getCurrentStateFromCookies() || '';
    this.fetchConnectedClients();
  }

  private fetchConnectedClients(): void {
    this.clientsSubscription = interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.clientService.getConnectedClients())
      )
      .subscribe(
        (clients) => {
          console.log('Updating clients:', clients);
          this.clients = clients;
        },
        (error) => console.error('Error fetching connected clients:', error)
      );
  }

  private handleChatHistory(chatHistory: any[]): void {
    console.log('Received chat history:', chatHistory);
    this.chatHistory = chatHistory;
    // Update your UI here
  }

  private getRoomNameFromCookies(): string | null {
    return this.getCookie('roomName');
  }

  private getCurrentStateFromCookies(): string | null {
    return this.getCookie('chatState');
  }

  private getCookie(name: string): string | null {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find((row) => row.startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
  }

  private setCookie(name: string, value: string, days: number = 30): void {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  }

  connectAsUser(): void {
    if (!this.socket) {
      const roomName = this.currentRoomName || localStorage.getItem('roomName');
      const savedState = this.currentState || localStorage.getItem('chatState');
      console.log('Connecting as user with room name:', roomName);
      console.log('Connecting as user with state:', savedState);
      this.socket = connectToServerAsUser(roomName || '', savedState || '');
      if (this.socket) {
        addListeners(
          this.socket,
          this.updateRoomName.bind(this),
          this.handleChatHistory.bind(this)
        );

        this.socket.on('message-from-server', (message: any) => {
          console.log('Received message from server:', message);
          this.chatHistory.push(message);
        });

        this.socket.on('chatState', (state: string) => {
          console.log('Received chat state:', state);
          this.currentState = state;
          this.setCookie('chatState', state);
          localStorage.setItem('chatState', state);
        });

        if (roomName) {
          this.socket.emit('getChatHistory', roomName);
        }
      }
    }
  }

  connectAsAdmin(roomName: string, event?: MouseEvent): void {
    if (event) {
      event.preventDefault(); // Prevent the default anchor action
    }

    if (!this.socket) {
      this.socket = connectToServerAsAdmin(roomName);
      if (this.socket) {
        addListeners(
          this.socket,
          this.updateRoomName.bind(this),
          this.handleChatHistory.bind(this)
        );
      }
    }
  }

  private updateRoomName(roomName: string): void {
    this.currentRoomName = roomName;
    this.setCookie('roomName', roomName);
    localStorage.setItem('roomName', roomName);
  }

  ngOnDestroy(): void {
    this.socket?.close();
    this.clientsSubscription?.unsubscribe();
  }
}
