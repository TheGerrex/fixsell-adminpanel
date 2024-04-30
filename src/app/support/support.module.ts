import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportRoutingModule } from './support-routing.module';
import { AngularMaterialModule } from '../shared/angular-material/angular-material.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, SupportRoutingModule, AngularMaterialModule],
  exports: [],
})
export class SupportModule {}
