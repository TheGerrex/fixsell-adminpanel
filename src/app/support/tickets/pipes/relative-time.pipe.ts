import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'relativeTime'
})
export class RelativeTimePipe implements PipeTransform {

  transform(value: Date | string | number | undefined): string {
    if (!value) {
      return 'N/A';
    }

    const now = new Date();
    const date = new Date(value);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    const diffInMs = now.getTime() - localDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `Hace pocos minutos`;
    } else if (diffInHours < 24) {
      return `Añadido en las últimas ${diffInHours} horas`;
    } else if (diffInDays < 7) {
      return `Añadido hace unos ${diffInDays} días`;
    } else {
      return formatDate(date, 'd MMM yyyy', 'en-US');
    }
  }
}