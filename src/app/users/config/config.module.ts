import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { UsersModule } from '../users.module';
import { ConfigRoutingModule } from './config-routing.module';
import { ConfigTabsComponent } from './components/config-tabs/config-tabs.component';
import { RolesCrudComponent } from './components/roles-tab/roles-crud/roles-crud.component';
import { PermissionsTabComponent } from './components/permissions-tab/permissions-tab.component';
@NgModule({
  declarations: [
    LayoutPageComponent,
    ConfigTabsComponent,
    RolesCrudComponent,
    PermissionsTabComponent,
  ],
  imports: [CommonModule, SharedModule, UsersModule, ConfigRoutingModule],
})
export class ConfigModule {}
