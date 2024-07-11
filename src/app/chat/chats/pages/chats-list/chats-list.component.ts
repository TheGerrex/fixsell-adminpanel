import { Component, OnInit, OnDestroy } from '@angular/core';
import { Manager, Socket } from 'socket.io-client';
import {
  connectToServerAsAdmin,
  addListeners,
  connectToServerAsUser,
} from '../../services/chat.service';
import { FormsModule } from '@angular/forms';
import { add } from 'date-fns';

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
  chatHistory: any[] = [];
  clients: { id: string; roomName: string }[] = [];
  private clientsSubscription: Subscription | undefined;
  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
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

  private getRoomNameFromCookies(): string | null {
    const cookies = document.cookie.split('; ');
    const roomNameCookie = cookies.find((row) => row.startsWith('roomName='));
    console.log('roomNameCookie', roomNameCookie);
    return roomNameCookie
      ? decodeURIComponent(roomNameCookie.split('=')[1])
      : null;
  }

  private handleChatHistory(chatHistory: any[]): void {
    this.chatHistory = chatHistory;
  }

  connectAsUser(): void {
    const roomName = this.getRoomNameFromCookies();
    if (!this.socket) {
      this.socket = connectToServerAsUser();
      if (this.socket) {
        addListeners(
          this.socket,
          this.updateRoomName.bind(this),
          this.handleChatHistory.bind(this)
        );
      }
    }
  }

  connectAsAdmin(roomName: string): void {
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
    document.cookie = `roomName=${roomName};path=/;max-age=${
      30 * 24 * 60 * 60
    }`;
  }
  ngOnDestroy(): void {
    this.socket?.close();
    this.clientsSubscription?.unsubscribe();
  }
}
