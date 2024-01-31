import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { PackageListComponent } from './pages/package-list/package-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { PackageRoutingModule } from './package-routing.module';
import { PackageCreateComponent } from './pages/package-create/package-create.component';

@NgModule({
  declarations: [
    LayoutPageComponent,
    PackageListComponent,
    PackageCreateComponent,
  ],
  imports: [
    CommonModule,
    PackageRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class PackageModule {}
