import { Component, OnInit, OnDestroy } from '@angular/core';
import { Socket } from 'socket.io-client';
import {
  connectToServer,
  addListeners,
  connectToServerAsClient,
  connectToServerAsEmployee,
  addClientListeners,
  addEmployeeListeners,
} from '../../services/chat.service';

@Component({
  selector: 'app-chats-list',
  standalone: true,
  templateUrl: './chats-list.component.html',
  styleUrls: ['./chats-list.component.scss'],
})
export class ChatsListComponent implements OnInit, OnDestroy {
  private socket: Socket | undefined;
  roomInput: string = ''; // Add this line
  employeeId: string = '';

  constructor() {}

  ngOnInit(): void {
    // Initial connection setup can be removed or modified as needed
    //get user id from local storage
    // this.employeeId = localStorage.getItem('employeeId') || '';
    const token = localStorage.getItem('token');
  }

  connectAsEmployee(roomId: string): void {
    if (!roomId) {
      console.error('Room ID is required');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Authentication token is required');
      return;
    }
    console.log('Connecting as employee with room id:', roomId);
    // Assuming connectToServerAsEmployee is updated to accept token
    this.socket = connectToServerAsEmployee(roomId, token);
    if (this.socket) {
      // Emitting 'connect-employee' with roomId and token
      this.socket.emit('connect-employee', { roomId, token });
      // Assuming addEmployeeListeners is a method to setup event listeners for the employee
      addEmployeeListeners(this.socket);
    }
  }

  connectAsClient(): void {
    this.socket = connectToServerAsClient();
    if (this.socket) {
      this.socket.emit('connect-client');
      addClientListeners(this.socket);
    }
  }

  ngOnDestroy(): void {
    this.socket?.close();
  }
}
