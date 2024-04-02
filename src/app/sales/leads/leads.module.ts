import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeadsRoutingModule } from './leads-routing.module';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';

import { SharedModule } from 'src/app/shared/shared.module';

import { LeadsListComponent } from './pages/leads-list/leads-list.component';
import { LeadsEditComponent } from './pages/leads-edit/leads-edit.component';
import { LeadsDetailComponent } from './pages/leads-detail/leads-detail.component';
import { WebsiteModule } from 'src/app/website/website.module';

@NgModule({
  declarations: [
    LayoutPageComponent,
    LeadsListComponent,
    LeadsEditComponent,
    LeadsDetailComponent,
  ],
  imports: [
    CommonModule,
    LeadsRoutingModule,
    SharedModule,
    WebsiteModule, // This is correct
  ],
})
export class LeadsModule {}
