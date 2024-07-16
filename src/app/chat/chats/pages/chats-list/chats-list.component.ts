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
    // this.connectAsUser(); // Attempt to connect on initialization
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

  private getRoomNameFromCookies(): string | null {
    const cookies = document.cookie.split('; ');
    const roomNameCookie = cookies.find((row) => row.startsWith('roomName='));
    console.log('roomNameCookie', roomNameCookie);
    return roomNameCookie
      ? decodeURIComponent(roomNameCookie.split('=')[1])
      : null;
  }

  private getCurrentStateFromCookies(): string | null {
    const cookies = document.cookie.split('; ');
    const currentStateCookie = cookies.find((row) =>
      row.startsWith('chatState=')
    );
    console.log('currentStateCookie', currentStateCookie);
    return currentStateCookie
      ? decodeURIComponent(currentStateCookie.split('=')[1])
      : null;
  }

  private handleChatHistory(chatHistory: any[]): void {
    console.log('Received chat history:', chatHistory);
    this.chatHistory = chatHistory;
    // Update your UI here
  }

  connectAsUser(): void {
    if (!this.socket) {
      console.log('Connecting as user with room name:', this.currentRoomName);
      console.log('Connecting as user with state:', this.currentState);
      this.socket = connectToServerAsUser(
        this.currentRoomName,
        this.currentState
      );
      if (this.socket) {
        addListeners(
          this.socket,
          this.updateRoomName.bind(this),
          this.handleChatHistory.bind(this)
        );

        // Listen for messages from the server
        this.socket.on('message-from-server', (message: any) => {
          console.log('Received message from server:', message);
          this.chatHistory.push(message);
          // Update your UI here
        });

        // Request chat history if we have a room name
        if (this.currentRoomName) {
          this.socket.emit('getChatHistory', this.currentRoomName);
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
    // Parse cookies into an object
    // Define the accumulator's type to allow string indexing
    const cookies = document.cookie
      .split('; ')
      .reduce((acc: { [key: string]: string }, current) => {
        const [key, value] = current.split('=');
        acc[key] = value;
        return acc;
      }, {});

    // Check if the roomName cookie exists and has the same value
    if (cookies['roomName'] !== roomName) {
      this.currentRoomName = roomName;
      document.cookie = `roomName=${roomName};path=/;max-age=${
        30 * 24 * 60 * 60
      }`;
    }
  }

  ngOnDestroy(): void {
    this.socket?.close();
    this.clientsSubscription?.unsubscribe();
  }
}
