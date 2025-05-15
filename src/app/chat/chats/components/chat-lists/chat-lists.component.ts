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
import { ChatHistoryService } from '../../services/chat-history.service';
import { WhatsAppService, WhatsAppChat } from '../../services/whatsapp.service';
import { interval, startWith, Subscription, switchMap } from 'rxjs';
import { CommunicationService } from '../../services/communication.service';

interface ChatItem {
  name: string;
  lastMessage: string;
  time: string;
  status: 'online' | 'offline';
  unreadCount?: number;
  roomId: string;
  isWhatsApp?: boolean; // Add flag to identify WhatsApp chats
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

  connectedClients: { id: string; roomName: string }[] = [];
  private clientsSubscription: Subscription | undefined;
  private chatMessages: ChatMessage[] = [];
  private whatsAppChats: WhatsAppChat[] = []; // Store WhatsApp chats
  private whatsAppSubscription: Subscription | undefined;

  constructor(
    private clientService: ClientService,
    private chatHistoryService: ChatHistoryService,
    private cdr: ChangeDetectorRef,
    private communicationService: CommunicationService,
    private whatsAppService: WhatsAppService, // Inject WhatsApp service
  ) {}

  ngOnInit(): void {
    this.fetchConnectedClients();
    this.loadChatHistory();
    this.fetchWhatsAppChats(); // Add method to fetch WhatsApp chats
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.clientsSubscription) {
      this.clientsSubscription.unsubscribe();
    }
    if (this.whatsAppSubscription) {
      this.whatsAppSubscription.unsubscribe();
    }
  }

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
    // Filter chats based on active tab (implement later)
  }

  selectChat(roomId: string) {
    // Handle differently based on chat type
    if (roomId.startsWith('whatsapp:')) {
      const phoneNumber = roomId.replace('whatsapp:', '');
      console.log('WhatsApp chat selected:', phoneNumber);
      // Emit different event for WhatsApp chats if needed
      this.communicationService.emitChatRoomSelected(roomId);
    } else {
      // Regular web chat
      this.communicationService.emitChatRoomSelected(roomId);
      console.log('Room selected:', roomId);
    }
  }

  private fetchConnectedClients(): void {
    this.clientsSubscription = interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.clientService.getConnectedClients()),
      )
      .subscribe(
        (clients) => {
          this.connectedClients = clients;
          this.updateChatItems();
          this.cdr.detectChanges();
        },
        (error) => console.error('Error fetching connected clients:', error),
      );
  }

  private loadChatHistory(): void {
    this.chatHistoryService.getChatHistory().subscribe(
      (messages: ChatMessage[]) => {
        this.chatMessages = messages;
        this.updateChatItems();
      },
      (error) => console.error('Error loading chat history:', error),
    );
  }

  private fetchWhatsAppChats(): void {
    // Poll for combined WhatsApp chats (both active and database)
    this.whatsAppSubscription = interval(10000)
      .pipe(
        startWith(0),
        switchMap(() => this.whatsAppService.getCombinedWhatsAppChats()),
      )
      .subscribe(
        (chats: WhatsAppChat[]) => {
          this.whatsAppChats = chats;
          this.updateChatItems();
          console.log('WhatsApp chats loaded:', chats.length);
        },
        (error) => console.error('Error loading WhatsApp chats:', error),
      );
  }

  private updateChatItems(): void {
    const chatItems: ChatItem[] = [];

    // Process regular web chats
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
          ?.senderName || 'Anonymous';

      const isOnline = this.connectedClients.some(
        (client) => client.roomName === roomId,
      );

      chatItems.push({
        name: senderName,
        lastMessage: latestMessage.message,
        time: new Date(latestMessage.timestamp).toLocaleTimeString(),
        status: isOnline ? 'online' : 'offline',
        roomId: roomId,
        isWhatsApp: false, // Regular web chat
      });
    }

    // Add WhatsApp chats
    for (const chat of this.whatsAppChats) {
      const lastActivityDate = new Date(chat.last_activity);
      chatItems.push({
        name: this.formatPhoneNumber(chat.phone_number), // Format the phone number for display
        lastMessage: chat.last_message,
        time: lastActivityDate.toLocaleTimeString(),
        status: 'online', // Assume WhatsApp users are online
        unreadCount: chat.interaction_count,
        roomId: `whatsapp:${chat.phone_number}`, // Prefix with whatsapp: to distinguish
        isWhatsApp: true, // Mark as WhatsApp chat
      });
    }

    // Sort all chats by time (most recent first)
    this.chats = chatItems.sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeB - timeA;
    });

    this.cdr.detectChanges();
  }

  // Helper method to format phone numbers for display
  private formatPhoneNumber(phoneNumber: string): string {
    // Keep only the last 10 digits for display if it's a long number
    if (phoneNumber.length > 10) {
      const digits = phoneNumber.replace(/\D/g, '');
      return digits.substring(Math.max(0, digits.length - 10));
    }
    return phoneNumber;
  }
}
