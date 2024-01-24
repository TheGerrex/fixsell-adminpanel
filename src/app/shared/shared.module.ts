import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from './angular-material/angular-material.module';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastComponent } from './components/toast/toast.component';
import { DialogComponent } from './components/dialog/dialog.component';

@NgModule({
  declarations: [
    SidenavComponent,
    BreadcrumbComponent,
    ToastComponent,
    DialogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    AngularMaterialModule,
    ReactiveFormsModule,
  ],
  exports: [
    SidenavComponent,
    BreadcrumbComponent,
    AngularMaterialModule,
    ReactiveFormsModule,
  ],
})
export class SharedModule {}
