import { Component, OnInit, OnDestroy } from '@angular/core';
import { Manager, Socket } from 'socket.io-client';
import { connectToServer, addListeners } from '../../services/chat.service';

import { add } from 'date-fns';
@Component({
  selector: 'app-chats-list',
  standalone: true,
  imports: [],
  templateUrl: './chats-list.component.html',
  styleUrls: ['./chats-list.component.scss'],
})
export class ChatsListComponent implements OnInit, OnDestroy {
  private socket: Socket | undefined;

  constructor() {}

  ngOnInit(): void {
    this.socket = connectToServer();
    if (this.socket) {
      addListeners(this.socket);
    }
  }

  ngOnDestroy(): void {
    this.socket?.close();
  }
}
