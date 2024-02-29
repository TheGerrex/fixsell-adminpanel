import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { UsersModule } from '../users.module';
import { UserRoutingModule } from './user-routing.module';

@NgModule({
  declarations: [LayoutPageComponent, UserListComponent],
  imports: [CommonModule, SharedModule, UsersModule, UserRoutingModule],
})
export class UserModule {}
