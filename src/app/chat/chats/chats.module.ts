import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatsRoutingModule } from './chats-routing.module';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';

import { SharedModule } from 'src/app/shared/shared.module';

import { WebsiteModule } from 'src/app/website/website.module';
import { ChatViewComponent } from './components/chat-view/chat-view.component';
import { ChatListsComponent } from './components/chat-lists/chat-lists.component';
import { MainChatPageComponent } from './pages/main-chat-page/main-chat-page.component';

@NgModule({
  declarations: [
    LayoutPageComponent,
    ChatViewComponent,
    ChatListsComponent,
    MainChatPageComponent,
  ],
  imports: [
    CommonModule,
    ChatsRoutingModule,
    SharedModule,
    WebsiteModule, // This is correct
  ],
})
export class ChatsModule {}
