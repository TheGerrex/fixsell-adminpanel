import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { PrintersRegisterComponent } from './components/printers-register/printers-register.component'; // Import the PrintersRegisterComponent
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { BodyComponent } from './components/body/body.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { SettingsComponent } from './components/settings/settings.component';
import { IntroScreenComponent } from './components/intro-screen/intro-screen.component';
import { PrinterscrudComponent } from './components/printerscrud/printerscrud.component';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
//import for mat-option
import { MatOptionModule } from '@angular/material/core';
// import for mat-icon
import { MatIconModule } from '@angular/material/icon';
// import for mat checkbox
import { MatCheckboxModule } from '@angular/material/checkbox';
//import for mat-chip
import { MatChipsModule } from '@angular/material/chips';
import { EditPrinterComponent } from './components/edit-printer/edit-printer.component';
import { UsersComponent } from './components/users/users.component';
import { UsersTableComponent } from './components/users-create/users-table.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';

@NgModule({
  declarations: [
    DashboardLayoutComponent,
    PrintersRegisterComponent,
    BodyComponent,
    SidenavComponent,
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
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatOptionModule,
    MatCheckboxModule,
    MatChipsModule,
  ],
  exports: [
    PrintersRegisterComponent, // Add the PrintersRegisterComponent to the exports array
  ],
})
export class DashboardModule {}
