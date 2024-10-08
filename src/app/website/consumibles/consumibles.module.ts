import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { ConsumiblesRoutingModule } from './consumibles-routing.module';
import { ConsumiblesListComponent } from './pages/consumibles-list/consumibles-list.component';
import { ConsumiblesCreateComponent } from './pages/consumibles-create/consumibles-create.component';
import { WebsiteModule } from '../website.module';
import { ConsumiblesDetailComponent } from './pages/consumibles-detail/consumibles-detail.component';
import { ConsumiblesEditComponent } from './pages/consumibles-edit/consumibles-edit.component';

@NgModule({
  declarations: [
    ConsumiblesListComponent,
    ConsumiblesCreateComponent,
    LayoutPageComponent,
    ConsumiblesDetailComponent,
    ConsumiblesEditComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ConsumiblesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    WebsiteModule,
  ],
})
export class ConsumiblesModule {}
