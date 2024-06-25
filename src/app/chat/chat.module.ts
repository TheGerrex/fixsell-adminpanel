import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatRoutingModule } from './chat-routing.module';
import { AngularMaterialModule } from '../shared/angular-material/angular-material.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, ChatRoutingModule, AngularMaterialModule],
})
export class ChatModule {}
