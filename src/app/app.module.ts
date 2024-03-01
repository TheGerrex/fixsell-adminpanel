import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from './shared/shared.module';
import localEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localEs, 'es');

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule, // Add HttpClientModule to imports
    FlexLayoutModule,
    BrowserAnimationsModule,
    SharedModule,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'es'}],
  bootstrap: [AppComponent],
})
export class AppModule {}
