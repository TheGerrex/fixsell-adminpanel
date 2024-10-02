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
  timestamp: string | Date; // Allow both string and Date
  isUser: boolean;
  isSystem?: boolean;
  senderId?: string;
  isAdmin?: boolean;
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
  private socket: Socket | undefined;
  isConnected: boolean = false;
  CurrentroomId: string | null = null;
  private lastSentMessage: string | null = null;
  private lastSentTimestamp: number | null = null;
  isAdminConnected = false;
  ngOnInit() {
    this.communicationService.chatRoomSelected.subscribe((roomId: string) => {
      this.CurrentroomId = roomId;
      this.loadChatHistory(roomId);
      this.connectToServer(roomId);
      this.connectAsAdmin(roomId);
    });

    if (this.CurrentroomId) {
      this.loadChatHistory(this.CurrentroomId);
      this.connectToServer(this.CurrentroomId);
      this.connectAsAdmin(this.CurrentroomId);
    }
  }

  ngOnDestroy() {
    this.disconnectFromServer();
  }

  handleIncomingMessage(message: any) {
    this.ngZone.run(() => {
      if (message.Message.includes('ha abandonado la conversación')) {
        this.isAdminConnected = false;
      } else if (message.Message.includes('se ha unido a la conversación')) {
        this.isAdminConnected = true;
      }

      const updatedMessage: Message = {
        content: message.Message,
        timestamp: new Date(),
        isUser: !message.isAdmin,
        isAdmin: message.isAdmin,
        senderId: message.FullName,
      };

      const currentMessages = this.messages$.getValue();
      this.messages$.next([...currentMessages, updatedMessage]);
    });
  }
  isRecentlySentMessage(content: string): boolean {
    const currentTime = Date.now();
    if (
      this.lastSentMessage === content &&
      this.lastSentTimestamp &&
      currentTime - this.lastSentTimestamp < 1000 // Within 1 second
    ) {
      return true;
    }
    return false;
  }

  connectAsAdmin(roomName: string, event?: MouseEvent): void {
    if (event) {
      event.preventDefault(); // Prevent the default anchor action
    }

    if (!this.socket) {
      this.socket = ChatService.connectToServerAsAdmin(roomName);
      if (this.socket) {
        ChatService.addListeners(
          this.socket,
          this.updateRoomName.bind(this),
          this.handleChatHistory.bind(this),
        );
      }
    }
  }
  connectToServer(roomId: string) {
    console.log(`Connecting to server with roomId: ${roomId}`);
    if (this.isConnected && this.socket) {
      this.disconnectFromServer();
    }

    this.socket = ChatService.connectToServerAsAdmin(roomId);

    if (this.socket) {
      console.log('socket connected');
      this.socket.emit('getChatHistory', roomId);
      ChatService.addListeners(
        this.socket,
        this.updateRoomName.bind(this),
        this.handleChatHistory.bind(this),
      );

      this.socket.on('connect', () => {
        console.log('Connected to server');
        this.isConnected = true;
        this.addSystemMessage('Connected to server.');
        const serverStatusLabel = document.querySelector('#server-status');
        if (serverStatusLabel) {
          serverStatusLabel.textContent = 'En Linea';
        }
        this.cdr.detectChanges();
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
        this.isConnected = false;
        this.addSystemMessage('Disconnected from server.');
        const serverStatusLabel = document.querySelector('#server-status');
        if (serverStatusLabel) {
          serverStatusLabel.textContent = 'Desconectado';
        }
        this.cdr.detectChanges();
      });

      // Listen for messages from the server
      this.socket.on('message-from-server', (message: any) => {
        console.log('Received message from server:', message);
        const updatedMessage = {
          ...message,
          senderId:
            message.senderId === this.socket?.id ? 'You' : message.senderId,
        };
        this.handleIncomingMessage(updatedMessage);
      });
    }
  }

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
      timestamp: new Date(message.timestamp), // Ensure this is a Date object
      isUser: message.senderId === this.userInfo.name,
      isSystem: false,
    }));
    this.messages$.next(this.messages); // Update BehaviorSubject
    this.cdr.detectChanges(); // Trigger change detection
  }

  disconnectFromServer() {
    if (this.isConnected && this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
      this.isConnected = false;
      this.addSystemMessage('Disconnected from server.');
      const serverStatusLabel = document.querySelector('#server-status');
      if (serverStatusLabel) {
        serverStatusLabel.textContent = 'Desconectado';
      }
      this.cdr.detectChanges();
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
    const systemMessage: Message = {
      content,
      timestamp: new Date(),
      isUser: false,
      isSystem: true,
    };
    const currentMessages = this.messages$.getValue();
    this.messages$.next([...currentMessages, systemMessage]);
    this.cdr.detectChanges(); // Trigger change detection
  }

  addUserMessage(content: string, isAdmin: boolean = false) {
    const userMessage: Message = {
      content,
      timestamp: new Date(), // Ensure this is a Date object
      isUser: !isAdmin,
      isAdmin: isAdmin,
      senderId: this.userInfo.name, // Use the userInfo.name for messages sent by this.client/admin
    };
    const currentMessages = this.messages$.getValue();
    this.messages$.next([...currentMessages, userMessage]);
    this.cdr.detectChanges(); // Trigger change detection
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  onSendMessage() {
    if (this.newMessage.trim()) {
      if (this.socket) {
        this.socket.emit('message-from-client', {
          id: this.socket.id,
          message: this.newMessage,
          timestamp: new Date(),
          roomName: this.CurrentroomId,
          isAdmin: true,
        });
      }
      this.lastSentMessage = this.newMessage;
      this.lastSentTimestamp = Date.now();
      this.newMessage = '';
      this.cdr.detectChanges();
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
