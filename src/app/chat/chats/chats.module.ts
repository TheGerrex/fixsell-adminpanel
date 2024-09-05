import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatsRoutingModule } from './chats-routing.module';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';

import { SharedModule } from 'src/app/shared/shared.module';

import { WebsiteModule } from 'src/app/website/website.module';
import { ChatListsComponent } from './components/chat-lists/chat-lists.component';

@NgModule({
  declarations: [LayoutPageComponent],
  imports: [
    CommonModule,
    ChatsRoutingModule,
    SharedModule,
    WebsiteModule, // This is correct
  ],
})
export class ChatsModule {}
