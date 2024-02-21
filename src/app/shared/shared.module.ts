import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from './angular-material/angular-material.module';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastComponent } from './components/toast/toast.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { PdfUploadComponent } from './components/pdf-upload/pdf-upload.component';
import { ExportComponent } from './components/export/export.component';
import { AddPrinterBrandDialogComponent } from './components/add-printer-brand-dialog/add-printer-brand-dialog.component';
import { AddPrinterCategoryDialogComponent } from './components/add-printer-category-dialog/add-printer-category-dialog.component';

@NgModule({
  declarations: [
    SidenavComponent,
    BreadcrumbComponent,
    ToastComponent,
    DialogComponent,
    FileUploadComponent,
    ConfirmDialogComponent,
    PdfUploadComponent,
    ExportComponent,
    AddPrinterBrandDialogComponent,
    AddPrinterCategoryDialogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    DragDropModule,
  ],
  exports: [
    SidenavComponent,
    BreadcrumbComponent,
    AngularMaterialModule,
    ReactiveFormsModule,
    FileUploadComponent,
    PdfUploadComponent,
    ExportComponent,
  ],
})
export class SharedModule {}
