import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrinterRoutingModule } from './printer-routing.module';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { PrinterListComponent } from './pages/printer-list/printer-list.component';
import { PrinterCreateComponent } from './pages/printer-create/printer-create.component';
import { PrinterDetailComponent } from './pages/printer-detail/printer-detail.component';
import { PrinterEditComponent } from './pages/printer-edit/printer-edit.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    LayoutPageComponent,
    PrinterListComponent,
    PrinterCreateComponent,
    PrinterDetailComponent,
    PrinterEditComponent
  ],
  imports: [
    CommonModule,
    PrinterRoutingModule,
    SharedModule,
  ]
})
export class PrinterModule { }
