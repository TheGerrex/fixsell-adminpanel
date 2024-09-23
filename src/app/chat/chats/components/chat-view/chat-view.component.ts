import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { Socket } from 'socket.io-client';
import { CommunicationService } from '../../services/communication.service';
import { ChatHistoryService } from '../../services/chat-history.service';
import { BehaviorSubject } from 'rxjs';
import { NgZone } from '@angular/core';
interface Message {
  content: string;
  timestamp: string;
  isUser: boolean;
  isSystem?: boolean;
  senderId?: string;
}

interface UserInfo {
  name: string;
  status: string;
  avatar: string;
}

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss'],
})
export class ChatViewComponent implements OnInit, OnDestroy {
  constructor(
    private communicationService: CommunicationService,
    private chatHistoryService: ChatHistoryService, // Inject ChatHistoryService
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  userInfo: UserInfo = {
    name: 'Gerardo Garcia',
    status: 'Web',
    avatar: 'G',
  };
  currentTime: string = '18:40 hrs';
  messages: Message[] = [];
  newMessage: string = '';
  showUserForm: boolean = false;
  userName: string = '';
  userEmail: string = '';
  messages$ = new BehaviorSubject<Message[]>([]);
  socket: Socket | null = null;
  isConnected: boolean = false;
  CurrentroomId: string | null = null;

  ngOnInit() {
    this.communicationService.chatRoomSelected.subscribe((roomId: string) => {
      this.CurrentroomId = roomId;
      this.loadChatHistory(roomId);
      this.connectToServer(roomId);
    });

    if (this.CurrentroomId) {
      this.loadChatHistory(this.CurrentroomId);
      this.connectToServer(this.CurrentroomId);
    }
  }

  ngOnDestroy() {
    this.disconnectFromServer();
  }

  handleIncomingMessage(message: any) {
    this.ngZone.run(() => {
      const updatedMessage: Message = {
        content: message.Message,
        timestamp: this.getCurrentTime(),
        isUser: message.FullName === 'You',
        senderId: message.FullName,
      };
      const currentMessages = this.messages$.getValue();
      this.messages$.next([...currentMessages, updatedMessage]);
    });
  }
  connectToServer(roomId: string) {
    console.log(`Connecting to server with roomId: ${roomId}`);
    if (this.isConnected && this.socket) {
      this.disconnectFromServer();
    }

    this.socket = ChatService.connectToServerAsAdmin(roomId) || null;

    this.socket?.on('message-from-server', (payload) => {
      this.handleIncomingMessage(payload);
    });

    if (this.socket) {
      ChatService.addListeners(
        this.socket,
        this.updateRoomName.bind(this),
        this.handleChatHistory.bind(this),
      );

      this.socket.on('message-from-server', (message: any) => {
        console.log('Received message from server:', message);
        const updatedMessage: Message = {
          content: message.Message,
          timestamp: this.getCurrentTime(),
          isUser: message.senderId === this.socket?.id,
          senderId:
            message.senderId === this.socket?.id ? 'You' : message.senderId,
        };
        this.messages.push(updatedMessage);
        this.cdr.detectChanges(); // Trigger change detection
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.addSystemMessage('Connected to server.');
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        this.addSystemMessage('Disconnected from server.');
      });
    }
  }

  // handleIncomingMessage(payload: {
  //   FullName: string;
  //   Message: string;
  //   RoomName: string;
  // }) {
  //   console.log('Handling incoming message:', payload);
  //   if (payload.RoomName === this.CurrentroomId) {
  //     this.messages.push({
  //       content: payload.Message,
  //       timestamp: new Date().toLocaleTimeString([], {
  //         hour: '2-digit',
  //         minute: '2-digit',
  //       }),
  //       isUser: payload.FullName === this.userInfo.name,
  //       isSystem: false,
  //     });
  //     this.cdr.detectChanges(); // Trigger change detection
  //   }
  // }

  updateRoomName(roomName: string) {
    console.log(`Joined room: ${roomName}`);
  }

  handleChatHistory(chatHistory: any[]) {
    console.log('Received chat history:', chatHistory);
    this.loadChatHistoryFromSocket(chatHistory);
  }

  loadChatHistory(roomId: string) {
    this.messages = [];
    this.chatHistoryService.getChatHistoryById(roomId).subscribe(
      (chatHistory: any[]) => {
        console.log('Loaded chat history:', chatHistory);
        this.loadChatHistoryFromSocket(chatHistory);
      },
      (error) => console.error('Error loading chat history:', error),
    );
  }

  loadChatHistoryFromSocket(chatHistory: any[]) {
    console.log('Processing chat history:', chatHistory);
    this.messages = chatHistory.map((message) => ({
      content: message.message,
      timestamp: new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isUser: message.senderId === this.userInfo.name,
      isSystem: false,
    }));
    this.cdr.detectChanges(); // Trigger change detection
  }

  disconnectFromServer() {
    if (this.isConnected && this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.addSystemMessage('Disconnected from server.');
    }
  }

  toggleConnection() {
    if (this.isConnected) {
      this.disconnectFromServer();
    } else {
      if (this.CurrentroomId) {
        this.connectToServer(this.CurrentroomId);
      } else {
        console.error('No room ID available to connect.');
      }
    }
  }

  addSystemMessage(content: string) {
    this.messages.push({
      content,
      timestamp: this.getCurrentTime(),
      isUser: false,
      isSystem: true,
    });
  }

  addUserMessage(content: string) {
    this.messages.push({
      content,
      timestamp: this.getCurrentTime(),
      isUser: true,
    });
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  onSendMessage() {
    if (this.newMessage.trim()) {
      this.addUserMessage(this.newMessage);
      if (this.socket) {
        this.socket.emit('message-from-client', {
          id: this.socket.id,
          message: this.newMessage,
          timestamp: new Date(),
          roomName: this.CurrentroomId,
        });
      }
      this.newMessage = '';
      this.cdr.detectChanges(); // Trigger change detection
    }
  }

  onSubmitUserForm() {
    this.showUserForm = false;
    this.addSystemMessage(
      `Gracias ${this.userName}. Estamos conectándote con un agente, este tendrá acceso a la información enviada en este chat.`,
    );
  }

  onFinishChat() {
    // Implement chat finish logic
    console.log('Chat finished');
  }

  onTransferChat() {
    // Implement chat transfer logic
    console.log('Chat transfer initiated');
  }
}
