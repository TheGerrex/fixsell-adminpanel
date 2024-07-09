import { Component, OnInit, OnDestroy } from '@angular/core';
import { Manager, Socket } from 'socket.io-client';
import {
  connectToServerAsAdmin,
  addListeners,
  connectToServerAsUser,
} from '../../services/chat.service';
import { FormsModule } from '@angular/forms';
import { add } from 'date-fns';
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

  constructor() {}
  private handleBeforeUnload = () => {
    console.log('Disconnecting socket before leaving the page...');
    this.socket?.disconnect();
  };
  ngOnInit(): void {
    // this.socket = connectToServer();
    // if (this.socket) {
    //   addListeners(this.socket, this.updateRoomName.bind(this)); // Modify this line
    // }
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }

  connectAsUser(): void {
    if (!this.socket) {
      this.socket = connectToServerAsUser();
      if (this.socket) {
        addListeners(this.socket, this.updateRoomName.bind(this));
      }
    }
  }

  connectAsAdmin(formValue: { roomName: string }): void {
    if (!this.socket) {
      this.socket = connectToServerAsAdmin(formValue.roomName); // Pass roomName here
      if (this.socket) {
        addListeners(this.socket, this.updateRoomName.bind(this));
      }
    }
  }

  private updateRoomName(roomName: string): void {
    this.currentRoomName = roomName;
  }
  ngOnDestroy(): void {
    this.socket?.close();

    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }
}
