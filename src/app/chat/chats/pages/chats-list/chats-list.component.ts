import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from 'src/app/chat/chats/services/socket.service'; // Adjust the path as necessary
import { Manager } from 'socket.io-client';
import { connectToServer } from '../../services/chat.service';
@Component({
  selector: 'app-chats-list',
  standalone: true,
  imports: [],
  templateUrl: './chats-list.component.html',
  styleUrls: ['./chats-list.component.scss'],
})
export class ChatsListComponent implements OnInit, OnDestroy {
  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    connectToServer();
    this.socketService.connect();
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}
