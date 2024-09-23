import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ChatListsComponent } from './../../components/chat-lists/chat-lists.component';
import { ChatViewComponent } from '../../components/chat-view/chat-view.component';
@Component({
  selector: 'app-main-chat-page',
  templateUrl: './main-chat-page.component.html',
  styleUrls: ['./main-chat-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainChatPageComponent implements OnInit {
  ngOnInit(): void {}
}
