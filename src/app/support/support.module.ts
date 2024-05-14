import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportRoutingModule } from './support-routing.module';
import { AngularMaterialModule } from '../shared/angular-material/angular-material.module';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { CustomDateAdapter } from './components/customDateAdapter';
@NgModule({
  declarations: [],
  imports: [CommonModule, SupportRoutingModule, AngularMaterialModule],
  exports: [],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: { dateInput: 'DD/MM/YYYY' },
        display: { dateInput: 'DD/MM/YYYY' },
      },
    },
    { provide: MAT_DATE_LOCALE, useValue: 'es-MX' }, // or whatever your locale is
  ],
})
export class SupportModule {}
