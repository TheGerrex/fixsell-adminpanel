import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ticketType',
  pure: true
})
export class TicketTypePipe implements PipeTransform {

  transform(value: string): string {
    let typeInSpanish: string;

    switch (value) {
      case 'remote':
        typeInSpanish = 'REMOTO';
        break;
      case 'on-site':
        typeInSpanish = 'SITIO';
        break;
      default:
        typeInSpanish = 'DESCONOCIDO';
    }

    return typeInSpanish;
  }

}
