import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ConfigRoutingModule } from './config-routing.module';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { ClientClassificationComponent } from './components/client-classification/client-classification.component';
import { SalesModule } from '../sales.module';
@NgModule({
  declarations: [
    LayoutPageComponent,
    ClientClassificationComponent
  ],
  imports: [
    CommonModule,
    ConfigRoutingModule,
    SharedModule,
    SalesModule
  ],
})
export class ConfigModule { }
