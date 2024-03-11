import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { BodyComponent } from './components/body/body.component';
import { SettingsComponent } from './components/settings/settings.component';
import { IntroScreenComponent } from './components/intro-screen/intro-screen.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    DashboardLayoutComponent,
    BodyComponent,
    SettingsComponent,
    IntroScreenComponent,
    // Add the PrintersRegisterComponent to the declarations array
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    DashboardRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
  ],
  exports: [],
})
export class DashboardModule {}
