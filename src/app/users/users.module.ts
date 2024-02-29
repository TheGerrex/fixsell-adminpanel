import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersRoutingModule } from './users-routing.module';
import { AngularMaterialModule } from '../shared/angular-material/angular-material.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, UsersRoutingModule, AngularMaterialModule],
  exports: [],
})
export class UsersModule {}
