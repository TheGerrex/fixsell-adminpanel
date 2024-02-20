import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteRoutingModule } from './website-routing.module';
import { ProductImageGridComponent } from './components/product-image-grid/product-image-grid.component';
import { AngularMaterialModule } from '../shared/angular-material/angular-material.module';
import { InputChipsComponent } from './components/input-chips/input-chips.component';

@NgModule({
  declarations: [ProductImageGridComponent, InputChipsComponent],
  imports: [CommonModule, WebsiteRoutingModule, AngularMaterialModule],
  exports: [ProductImageGridComponent, InputChipsComponent],
})
export class WebsiteModule {}
