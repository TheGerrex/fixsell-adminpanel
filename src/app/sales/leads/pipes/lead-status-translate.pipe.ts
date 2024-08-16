import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'leadStatusTranslate',
  standalone: true
})
export class LeadStatusTranslatePipe implements PipeTransform {

  transform(value: string): string {
    const statusTranslations: { [key: string]: string } = {
      'prospect': 'Prospecto',
      // Add more translations here
    };

    return statusTranslations[value as keyof typeof statusTranslations] || value;
  }

}