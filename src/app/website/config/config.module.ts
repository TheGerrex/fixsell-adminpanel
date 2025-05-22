import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { WebsiteModule } from '../website.module';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { ConfigRoutingModule } from './config-routing.module';
import { ConfigTabsComponent } from './components/config-tabs/config-tabs.component';
import { PrinterTabComponent } from './components/printer-tab/printer-tab.component';
import { BrandCrudComponent } from './components/printer-tab/brand-crud/brand-crud.component';
import { CategoriesCrudComponent } from './components/printer-tab/categories-crud/categories-crud.component';
@NgModule({
  declarations:
    [
      LayoutPageComponent,
      ConfigTabsComponent,
      PrinterTabComponent,
      BrandCrudComponent,
      CategoriesCrudComponent
    ],

  imports:
    [
      CommonModule,
      ConfigRoutingModule,
      SharedModule,
      WebsiteModule
    ],
})
export class ConfigModule { }
