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
import { InputChipsComponent } from './components/input-chips/input-chips.component';
import { SelectChipsComponent } from './components/select-chips/select-chips.component';
import { AddUserRoleDialogComponent } from './components/add-user-role-dialog/add-user-role-dialog.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { QuillModule } from 'ngx-quill';
import { FormsModule } from '@angular/forms';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { ButtonResizeDirective } from './directives/button-resize.directive';
import { EditUserRoleDialogComponent } from './components/edit-user-role-dialog/edit-user-role-dialog.component';
import { RichTextEditorComponent } from './components/rich-text-editor/rich-text-editor.component';
import { DeleteUserRoleDialogComponent } from './components/delete-user-role-dialog/delete-user-role-dialog.component';
import { EditPrinterBrandDialogComponent } from './components/edit-printer-brand-dialog/edit-printer-brand-dialog.component';
import { EditPrinterCategoryDialogComponent } from './components/edit-printer-category-dialog/edit-printer-category-dialog.component';
import { CapitalizeDatePipe } from './pipes/capitalize-month.pipe';
import { HasPermissionPipe } from './pipes/has-permission.pipe';
import { PermissionsComponent } from './components/permissions/permissions.component';

// Import your dependencies that are used in the template
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
// Import any other needed modules/components
import { DataTableComponent } from './components/data-table/data-table.component';
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
    InputChipsComponent,
    SelectChipsComponent,
    AddUserRoleDialogComponent,
    LoadingSpinnerComponent,
    DropdownComponent,
    ButtonResizeDirective,
    EditUserRoleDialogComponent,
    EditPrinterBrandDialogComponent,
    EditPrinterCategoryDialogComponent,
    RichTextEditorComponent,
    DeleteUserRoleDialogComponent,
    CapitalizeDatePipe,
    HasPermissionPipe,
    PermissionsComponent,
    LoadingSpinnerComponent,
    HasPermissionPipe,
    SafeHtmlPipe,
    DataTableComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    DragDropModule,
    QuillModule,
    FormsModule,
    TimepickerModule.forRoot(),
  ],
  exports: [
    SidenavComponent,
    BreadcrumbComponent,
    AngularMaterialModule,
    ReactiveFormsModule,
    FileUploadComponent,
    PdfUploadComponent,
    ExportComponent,
    InputChipsComponent,
    SelectChipsComponent,
    LoadingSpinnerComponent,
    QuillModule,
    FormsModule,
    TimepickerModule,
    DropdownComponent,
    ButtonResizeDirective,
    EditUserRoleDialogComponent,
    EditPrinterBrandDialogComponent,
    EditPrinterCategoryDialogComponent,
    RichTextEditorComponent,
    DeleteUserRoleDialogComponent,
    CapitalizeDatePipe,
    HasPermissionPipe,
    PermissionsComponent,
    DataTableComponent,
  ],
})
export class SharedModule {}
