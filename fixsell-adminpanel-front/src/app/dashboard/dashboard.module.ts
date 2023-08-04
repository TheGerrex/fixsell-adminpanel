import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { PrintersRegisterComponent } from './components/printers-register/printers-register.component'; // Import the PrintersRegisterComponent
import { HttpClientModule } from '@angular/common/http';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DashboardLayoutComponent,
    PrintersRegisterComponent // Add the PrintersRegisterComponent to the declarations array
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    DashboardRoutingModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  exports: [
    PrintersRegisterComponent // Add the PrintersRegisterComponent to the exports array
  ]
})
export class DashboardModule { }