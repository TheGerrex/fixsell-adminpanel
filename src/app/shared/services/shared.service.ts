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

  constructor() {}

  changePrinterModel(model: string) {
    this.printerModel.next(model);
  }

  changeDealName(name: string) {
    this.dealNameSource.next(name);
  }
}
