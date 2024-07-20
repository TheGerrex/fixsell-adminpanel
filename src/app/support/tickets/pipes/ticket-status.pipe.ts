import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ticketStatus',
  pure: true
})
export class TicketStatusPipe implements PipeTransform {

  transform(value: string): string {
    let statusInSpanish: string;

    switch (value) {
      case 'open':
        statusInSpanish = 'ABIERTO';
        break;
      case 'completed':
        statusInSpanish = 'COMPLETADO';
        break;
      case 'in_progress':
        statusInSpanish = 'EN PROGRESO';
        break;
      case 'without_resolution':
        statusInSpanish = 'SIN RESOLUCION';
        break;
      // Add more cases as needed...
      default:
        statusInSpanish = 'DESCONOCIDO';
    }

    return statusInSpanish;
  }

}