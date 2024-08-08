import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localDate'
})
export class LocalDatePipe implements PipeTransform {

  transform(date: Date | undefined): string {
    if (!(date instanceof Date)) {
      // The date is not a Date object
      return '';
    } else {
      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      );
      return localDate.toISOString();
    }
  }

}