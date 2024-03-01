import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealRoutingModule } from './deal-routing.module';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { DealListComponent } from './pages/deal-list/deal-list.component';
import { DealCreateComponent } from './pages/deal-create/deal-create.component';
import { DealDetailComponent } from './pages/deal-detail/deal-detail.component';
import { DealEditComponent } from './pages/deal-edit/deal-edit.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { WebsiteModule } from '../website.module';
@NgModule({
  declarations: [
    LayoutPageComponent,
    DealListComponent,
    DealCreateComponent,
    DealDetailComponent,
    DealEditComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    DealRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    WebsiteModule,
  ],
})
export class DealModule {}
