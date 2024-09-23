// Shared Service to share between components
import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  chatRoomSelected: EventEmitter<string> = new EventEmitter<string>();

  emitChatRoomSelected(roomId: string) {
    this.chatRoomSelected.emit(roomId);
  }
}
