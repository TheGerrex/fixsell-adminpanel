import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from './shared/shared.module';
import localeEs from '@angular/common/locales/es-MX';
import { registerLocaleData } from '@angular/common';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { IConfig } from 'ngx-mask';
import { TicketsModule } from './support/tickets/tickets.module';

const maskConfig: Partial<IConfig> = {
  validation: false,
};

registerLocaleData(localeEs, 'es');

@NgModule({ declarations: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        FlexLayoutModule,
        BrowserAnimationsModule,
        SharedModule,
        NgxMaskDirective,
        NgxMaskPipe,
        TicketsModule,
        CalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory,
        })
    ], 
    providers: [
        { provide: LOCALE_ID, useValue: 'es' },
        provideNgxMask(maskConfig),
        provideHttpClient(withInterceptorsFromDi()),
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
