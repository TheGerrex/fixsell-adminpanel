import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LiveChatRoutingModule } from './live-chat-routing.module';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';

import { SharedModule } from 'src/app/shared/shared.module';

import { WebsiteModule } from 'src/app/website/website.module';

@NgModule({
  declarations: [LayoutPageComponent],
  imports: [
    CommonModule,
    LiveChatRoutingModule,
    SharedModule,
    WebsiteModule, // This is correct
  ],
})
export class LivechatsModule {}
