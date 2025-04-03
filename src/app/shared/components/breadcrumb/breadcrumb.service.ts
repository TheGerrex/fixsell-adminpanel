import { Injectable } from '@angular/core';
import { PrinterService } from 'src/app/website/printer/services/printer.service';
import { ConsumiblesService } from '../../../website/consumibles/services/consumibles.service';
import { UsersService } from 'src/app/users/services/users.service';
import { Observable } from 'rxjs';
import { ClientsService } from 'src/app/clients/services/clients.service';

@Injectable({
  providedIn: 'root',
})
export class ItemNameService {
  constructor(
    private printerService: PrinterService,
    private consumiblesService: ConsumiblesService,
    private usersService: UsersService,
    private clientsService: ClientsService,
  ) { }

  token = localStorage.getItem('token');

  getItemName(type: string, id: string): Observable<string> {
    switch (type) {
      case 'printers':
        return this.printerService.getPrinterName(id);
      case 'consumibles':
        return this.consumiblesService.getConsumibleName(id);
      case 'user':
        return this.usersService.getUserName(id, this.token ?? '');
      case 'clients':
        return this.clientsService.getClientCommercialName(id);
      default:
        throw new Error(`Unsupported item type: ${type}`);
    }
  }
}
