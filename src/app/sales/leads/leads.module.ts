import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeadsRoutingModule } from './leads-routing.module';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';

import { SharedModule } from 'src/app/shared/shared.module';

import { LeadsListComponent } from './pages/leads-list/leads-list.component';

@NgModule({
  declarations: [LayoutPageComponent, LeadsListComponent],
  imports: [CommonModule, LeadsRoutingModule, SharedModule],
})
export class LeadsModule {}
