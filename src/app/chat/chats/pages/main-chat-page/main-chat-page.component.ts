import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ChatListsComponent } from './../../components/chat-lists/chat-lists.component';
import { ChatsListComponent } from './../../pages/chats-list/chats-list.component';
@Component({
  selector: 'app-main-chat-page',
  standalone: true,
  imports: [CommonModule, ChatListsComponent, ChatsListComponent],
  templateUrl: './main-chat-page.component.html',
  styleUrls: ['./main-chat-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainChatPageComponent implements OnInit {
  ngOnInit(): void {}
}
