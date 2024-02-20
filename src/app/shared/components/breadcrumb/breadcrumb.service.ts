import { Injectable } from '@angular/core';
import { PrinterService } from 'src/app/website/printer/services/printer.service';
import { ConsumiblesService } from '../../../website/consumibles/services/consumibles.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ItemNameService {
  constructor(
    private printerService: PrinterService,
    private consumiblesService: ConsumiblesService
  ) {}

  getItemName(type: string, id: string): Observable<string> {
    switch (type) {
      case 'printers':
        return this.printerService.getPrinterName(id);
      case 'consumibles':
        return this.consumiblesService.getConsumibleName(id);
      // Add more cases here as needed
      default:
        throw new Error(`Unsupported item type: ${type}`);
    }
  }
}
