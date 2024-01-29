import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private printerModel = new BehaviorSubject<string>('');
  currentPrinterModel = this.printerModel.asObservable();

  private dealNameSource = new BehaviorSubject<string>('');
  currentDealName = this.dealNameSource.asObservable();

  private consumablesModel = new BehaviorSubject<string>('');
  currentConsumablesModel = this.consumablesModel.asObservable();

  constructor() {}

  changePrinterModel(model: string) {
    this.printerModel.next(model);
  }

  changeDealName(name: string) {
    this.dealNameSource.next(name);
  }

  changeConsumiblesModel(model: string) {
    this.consumablesModel.next(model);
  }
}
