import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'capitalizeDate',
})
export class CapitalizeDatePipe extends DatePipe implements PipeTransform {
  override transform(
    value: Date | string | number | null | undefined,
    format?: string,
    timezone?: string,
    locale?: string,
  ): string | null;
  override transform(
    value: null | undefined,
    format?: string,
    timezone?: string,
    locale?: string,
  ): null;
  override transform(
    value: Date | string | number | null | undefined,
    format: string = 'd MMM yyyy',
    timezone?: string,
    locale: string = 'es-ES',
  ): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const date = super.transform(value, format, timezone, locale);
    return date
      ? date.replace(/\b(\w)/g, (match) => match.toUpperCase())
      : null;
  }
}
