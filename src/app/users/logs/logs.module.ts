import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';

import { SharedModule } from 'src/app/shared/shared.module';
import { UsersModule } from '../users.module';
import { LogsRoutingModule } from './logs-routing.module';

import { AngularMaterialModule } from 'src/app/shared/angular-material/angular-material.module';
import { LogsListComponent } from './pages/logs-list/logs-list.component';

@NgModule({
  declarations: [LayoutPageComponent, LogsListComponent],
  imports: [
    CommonModule,
    SharedModule,
    UsersModule,
    LogsRoutingModule,
    AngularMaterialModule,
  ],
})
export class LogsModule {}
