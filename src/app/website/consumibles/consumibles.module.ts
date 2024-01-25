import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
//routing module
import { ConsumiblesRoutingModule } from './consumibles-routing.module';
import { ConsumiblesListComponent } from './pages/consumibles-list/consumibles-list.component';
import { ConsumiblesCreateComponent } from './pages/consumibles-create/consumibles-create.component';

@NgModule({
  declarations: [
    ConsumiblesListComponent,
    // DealDetailComponent,
    ConsumiblesCreateComponent,
    // DealEditComponent,
    LayoutPageComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ConsumiblesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class ConsumiblesModule {}
