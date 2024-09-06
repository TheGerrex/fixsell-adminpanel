import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
interface Message {
  content: string;
  timestamp: string;
  isUser: boolean;
  isSystem?: boolean;
}

interface UserInfo {
  name: string;
  status: string;
  avatar: string;
}

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrl: './chat-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatViewComponent implements OnInit {
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

  ngOnInit() {
    this.initializeChat();
  }

  initializeChat() {
    this.addSystemMessage(
      '¡Hola! 👋 Vamos a comenzar con su consulta. Estoy aquí para ayudarte en lo que necesites.',
    );
    this.addSystemMessage(
      'Para atenderlo mejor necesitamos algunos datos adicionales:',
    );
    this.showUserForm = true;
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
      this.newMessage = '';
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
