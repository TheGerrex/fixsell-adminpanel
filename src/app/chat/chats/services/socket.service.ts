// src/app/chat/chats/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket | undefined;
  private url = `${environment.baseUrl}/socket.io/socket.io.js`; // Your server URL

  constructor() {}

  connect(): void {
    this.socket = io(this.url, { autoConnect: true });

    this.socket.on('connect', () => {
      console.log(`Connected to server with ID: ${this.socket?.id}`);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
