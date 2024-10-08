import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { ClientService } from '../../services/client.service';
import { ChatHistoryService } from '../../services/chat-history.service'; // Import ChatHistoryService
import { interval, startWith, Subscription, switchMap } from 'rxjs';
import { CommunicationService } from '../../services/communication.service';
interface ChatItem {
  name: string;
  lastMessage: string;
  time: string;
  status: 'online' | 'offline';
  unreadCount?: number;
  roomId: string;
}

interface ChatMessage {
  id: number;
  roomId: string;
  senderId: string;
  senderName: string | null;
  message: string;
  timestamp: string;
}

interface GroupedMessages {
  [roomId: string]: ChatMessage[];
}

@Component({
  selector: 'app-chat-lists',
  templateUrl: './chat-lists.component.html',
  styleUrls: ['./chat-lists.component.scss'],
})
export class ChatListsComponent implements OnInit {
  @Output() chatRoomSelected: EventEmitter<string> = new EventEmitter<string>();

  chats: ChatItem[] = [];
  tabs = [
    { name: 'Sin Operador', count: 0 },
    { name: 'Mis chats', count: 5 },
    { name: 'Todos', count: 15 },
  ];
  activeTab = 'Todos';

  connectedClients: { id: string; roomName: string }[] = []; // Add property to store connected clients
  private clientsSubscription: Subscription | undefined;
  private chatMessages: ChatMessage[] = []; // Store chat messages

  constructor(
    private clientService: ClientService,
    private chatHistoryService: ChatHistoryService, // Inject ChatHistoryService
    private cdr: ChangeDetectorRef, // Inject ChangeDetectorRef
    private communicationService: CommunicationService, // Inject CommunicationService
  ) {}

  ngOnInit(): void {
    this.fetchConnectedClients(); // Call method to load connected clients
    this.loadChatHistory(); // Call method to load chat history
  }

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
    // Here you would typically filter the chats based on the active tab
  }

  selectChat(roomId: string) {
    this.communicationService.emitChatRoomSelected(roomId);
    console.log('Room selected:', roomId);
  }

  private fetchConnectedClients(): void {
    this.clientsSubscription = interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.clientService.getConnectedClients()),
      )
      .subscribe(
        (clients) => {
          // console.log('Updating clients:', clients);
          this.connectedClients = clients;
          this.updateChatItems(); // Update chat items when connected clients are updated
          this.cdr.detectChanges(); // Manually trigger change detection
        },
        (error) => console.error('Error fetching connected clients:', error),
      );
  }

  private loadChatHistory(): void {
    this.chatHistoryService.getChatHistory().subscribe(
      (messages: ChatMessage[]) => {
        this.chatMessages = messages; // Store chat messages
        this.updateChatItems(); // Update chat items when chat history is loaded
      },
      (error) => console.error('Error loading chat history:', error),
    );
  }

  private updateChatItems(): void {
    const chatItems: ChatItem[] = [];
    const groupedMessages: GroupedMessages = this.chatMessages.reduce(
      (acc: GroupedMessages, message: ChatMessage) => {
        if (!acc[message.roomId]) {
          acc[message.roomId] = [];
        }
        acc[message.roomId].push(message);
        return acc;
      },
      {},
    );

    for (const roomId in groupedMessages) {
      const roomMessages = groupedMessages[roomId];
      const latestMessage = roomMessages.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )[0];

      const senderName =
        roomMessages.find((message) => message.senderName !== null)
          ?.senderName || 'Anonymous'; // Use 'Anonymous' as fallback if no senderName is found

      const isOnline = this.connectedClients.some(
        (client) => client.roomName === roomId,
      );

      chatItems.push({
        name: senderName,
        lastMessage: latestMessage.message,
        time: new Date(latestMessage.timestamp).toLocaleTimeString(),
        status: isOnline ? 'online' : 'offline', // Set status based on connected clients
        roomId: roomId,
      });
    }

    this.chats = chatItems;
    this.cdr.detectChanges(); // Manually trigger change detection
  }
}
