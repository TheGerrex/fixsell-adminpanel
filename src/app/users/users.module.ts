import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersRoutingModule } from './users-routing.module';
import { AngularMaterialModule } from '../shared/angular-material/angular-material.module';
import { DropdownRolesComponent } from './components/dropdown-roles/dropdown-roles.component';

@NgModule({
  declarations: [
    DropdownRolesComponent,
  ],
  imports: [CommonModule, UsersRoutingModule, AngularMaterialModule],
  exports: [DropdownRolesComponent],
})
export class UsersModule {}
