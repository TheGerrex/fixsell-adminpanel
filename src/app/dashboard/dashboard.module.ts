import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { PrintersRegisterComponent } from './components/printers-register/printers-register.component'; // Import the PrintersRegisterComponent
import { BodyComponent } from './components/body/body.component';
import { SettingsComponent } from './components/settings/settings.component';
import { IntroScreenComponent } from './components/intro-screen/intro-screen.component';
import { PrinterscrudComponent } from './components/printerscrud/printerscrud.component';
import { EditPrinterComponent } from './components/edit-printer/edit-printer.component';
import { UsersComponent } from './components/users/users.component';
import { UsersTableComponent } from './components/users-create/users-table.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    DashboardLayoutComponent,
    PrintersRegisterComponent,
    BodyComponent,
    SettingsComponent,
    IntroScreenComponent,
    PrinterscrudComponent,
    EditPrinterComponent,
    UsersComponent,
    UsersTableComponent,
    UserEditComponent, // Add the PrintersRegisterComponent to the declarations array
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    DashboardRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
  ],
  exports: [
    PrintersRegisterComponent, // Add the PrintersRegisterComponent to the exports array
  ],
})
export class DashboardModule {}
