import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { LeadsRoutingModule } from './leads-routing.module';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';

import { SharedModule } from 'src/app/shared/shared.module';

import { LeadsListComponent } from './pages/leads-list/leads-list.component';
import { LeadsEditComponent } from './pages/leads-edit/leads-edit.component';
import { LeadsDetailComponent } from './pages/leads-detail/leads-detail.component';
import { WebsiteModule } from 'src/app/website/website.module';
import { LeadsCreateComponent } from './pages/leads-create/leads-create.component';
import { CommunicationDetailComponent } from './pages/communication-detail/communication-detail.component';
import { CommunicationCreateComponent } from './pages/communication-create/communication-create.component';
import { CommunicationEditComponent } from './pages/communication-edit/communication-edit.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

@NgModule({
  declarations: [
    LayoutPageComponent,
    LeadsListComponent,
    LeadsEditComponent,
    LeadsDetailComponent,
    LeadsCreateComponent,
    CommunicationDetailComponent,
    CommunicationCreateComponent,
    CommunicationEditComponent,
  ],
  imports: [
    CommonModule,
    LeadsRoutingModule,
    SharedModule,
    NgxMaskDirective,
    NgxMaskPipe,
    WebsiteModule,
  ],
  providers: [DatePipe, provideNgxMask()],
})
export class LeadsModule {}
