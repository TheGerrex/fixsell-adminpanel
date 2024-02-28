import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteRoutingModule } from './website-routing.module';
import { ProductImageGridComponent } from './components/product-image-grid/product-image-grid.component';
import { AngularMaterialModule } from '../shared/angular-material/angular-material.module';
import { InputChipsComponent } from './components/input-chips/input-chips.component';
import { DealsComponent } from './components/deals/deals.component';
import { ConsumableComponent } from './components/consumable/consumable.component';
import { CarouselImagesComponent } from './components/carousel-images/carousel-images.component';
import { PrinterComponent } from './components/printer/printer.component';
import { CounterpartsComponent } from './components/counterparts/counterparts.component';

@NgModule({
  declarations: [
    ProductImageGridComponent, 
    InputChipsComponent, 
    DealsComponent, 
    ConsumableComponent, 
    CarouselImagesComponent, PrinterComponent, CounterpartsComponent
  ],
  imports: [
    CommonModule, 
    WebsiteRoutingModule, 
    AngularMaterialModule
  ],
  exports: [
    ProductImageGridComponent, 
    InputChipsComponent, 
    DealsComponent, 
    ConsumableComponent, 
    CarouselImagesComponent,
    PrinterComponent,
    CounterpartsComponent,
  ],
})
export class WebsiteModule {}
