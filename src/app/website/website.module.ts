import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteRoutingModule } from './website-routing.module';
import { ProductImageGridComponent } from './components/product-image-grid/product-image-grid.component';
import { AngularMaterialModule } from '../shared/angular-material/angular-material.module';

@NgModule({
  declarations: [ProductImageGridComponent],
  imports: [CommonModule, WebsiteRoutingModule, AngularMaterialModule],
  exports: [ProductImageGridComponent],
})
export class WebsiteModule {}
