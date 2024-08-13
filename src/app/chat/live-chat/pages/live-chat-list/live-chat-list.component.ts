import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-live-chat-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-chat-list.component.html',
  styleUrl: './live-chat-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveChatListComponent {}
