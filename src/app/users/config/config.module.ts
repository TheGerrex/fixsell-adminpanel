import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { UsersModule } from '../users.module';
import { ConfigRoutingModule } from './config-routing.module';
import { ConfigTabsComponent } from './components/config-tabs/config-tabs.component';

@NgModule({
  declarations: [LayoutPageComponent, ConfigTabsComponent],
  imports: [CommonModule, SharedModule, UsersModule, ConfigRoutingModule],
})
export class ConfigModule {}
