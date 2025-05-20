import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesRoutingModule } from '../sales-routing.module';
import { AngularMaterialModule } from 'src/app/shared/angular-material/angular-material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ConfigRoutingModule } from 'src/app/website/config/config-routing.module';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { ClientClassificationComponent } from './components/client-classification/client-classification.component';
@NgModule({
  declarations: [LayoutPageComponent, ClientClassificationComponent],
  imports: [
    CommonModule,
    SalesRoutingModule,
    ConfigRoutingModule,
    AngularMaterialModule,
    SharedModule,
  ],
})
export class ConfigModule {}
