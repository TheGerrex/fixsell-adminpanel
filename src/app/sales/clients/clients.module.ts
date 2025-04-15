import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsRoutingModule } from './clients-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { ClientsListComponent } from './pages/clients-list/clients-list.component';
import { ClientDetailComponent } from './pages/client-detail/client-detail.component';
import { ClientCreateComponent } from './pages/client-create/client-create.component';
import { ClientEditComponent } from './pages/client-edit/client-edit.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
@NgModule({
  declarations: [
    LayoutPageComponent,
    ClientsListComponent,
    ClientDetailComponent,
    ClientCreateComponent,
    ClientEditComponent,
  ],
  imports: [
    CommonModule,
    ClientsRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
  ],
  providers: [provideNgxMask()],
})
export class ClientsModule { }
