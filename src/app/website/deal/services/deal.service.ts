import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { Printer } from '../../interfaces/printer.interface';
import { Consumible } from '../../interfaces/consumibles.interface';
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DealService {
  constructor(private http: HttpClient) {}

  //get printer name by id
  getPrinterName(id: string): Observable<string> {
    return this.http
      .get<Printer>(`${environment.baseUrl}/printers/${id}`)
      .pipe(map((printer: any) => printer.model));
  }

  //get all printer names
  getAllPrinterNames(): Observable<string[]> {
    return this.http
      .get<Printer[]>(`${environment.baseUrl}/printers`)
      .pipe(
        map((printers: Printer[]) => printers.map((printer) => printer.model))
      );
  }

  // get all consumibles names
  getAllConsumiblesNames(): Observable<string[]> {
    return this.http
      .get<Consumible[]>(`${environment.baseUrl}/consumibles`)
      .pipe(
        map((consumibles: Consumible[]) =>
          consumibles.map((consumible) => consumible.name)
        )
      );
  }

  //find printer id by name
  findPrinterIdByName(name: string): Observable<string> {
    return this.http.get<Printer[]>(`${environment.baseUrl}/printers`).pipe(
      map((printers: Printer[]) => {
        const printer = printers.find((printer) => printer.model === name);
        return printer ? printer.id : '';
      })
    );
  }

  //
  findConsumibleIdByName(name: string): Observable<string> {
    return this.http
      .get<Consumible[]>(`${environment.baseUrl}/consumibles`)
      .pipe(
        map((consumibles: Consumible[]) => {
          const consumible = consumibles.find(
            (consumible) => consumible.name === name
          );
          return consumible ? consumible.id : '';
        }),
        map((id: string | undefined) => id || '') // handle undefined case and return empty string
      );
  }

  //find price of printer by name
  findPrinterPriceByName(name: string): Observable<number> {
    return this.http.get<Printer[]>(`${environment.baseUrl}/printers`).pipe(
      tap(() => console.log(`Fetching price for printer: ${name}`)), // log the name of the printer
      map((printers: Printer[]) => {
        const printer = printers.find((printer) => printer.model === name);
        const price = printer ? printer.price : 0;
        console.log(`Found price: ${price}`); // log the found price
        return price;
      }),
      catchError((error) => {
        console.error(`Error fetching price for printer: ${name}`, error); // log the error
        return of(0); // return a default price of 0 in case of error
      })
    );
  }
  //create deal for printer by name
  createDealForPrinterByName(name: string, deal: any): Observable<any> {
    return this.findPrinterIdByName(name).pipe(
      switchMap((id) => {
        if (id) {
          deal.printer = id; // set the printer id in the deal object
          return this.http.post(`${environment.baseUrl}/deals`, deal);
        } else {
          throw new Error('Printer not found');
        }
      })
    );
  }

  getPrinterPrice(name: string): Observable<number> {
    return this.findPrinterIdByName(name).pipe(
      switchMap((id) => {
        if (id) {
          return this.http.get<Printer>(
            `${environment.baseUrl}/printers/${id}`
          );
        } else {
          throw new Error('Printer not found');
        }
      }),
      map((printer: Printer) => printer.price)
    );
  }

  // get consumible price by name
  getConsumiblePrice(name: string): Observable<number> {
    return this.http
      .get<Consumible[]>(`${environment.baseUrl}/consumibles`)
      .pipe(
        map((consumibles: Consumible[]) => {
          const consumible = consumibles.find(
            (consumible) => consumible.name === name
          );
          return consumible ? consumible.price : 0;
        })
      );
  }
  // delete deal by id
  deleteDealById(id: string): Observable<any> {
    return this.http.delete(`${environment.baseUrl}/deals/${id}`, {
      responseType: 'text',
    });
  }

  // get deal by id
  getDeal(id: string): Observable<any> {
    return this.http.get(`${environment.baseUrl}/deals/${id}`);
  }

  // get all deals
  getAllDeals(): Observable<any> {
    return this.http.get(`${environment.baseUrl}/deals`);
  }

  // submit deal edit form
  submitDealEditForm(formData: any, dealId: string): Observable<any> {
    return this.http.patch(`${environment.baseUrl}/deals/${dealId}`, formData);
  }

  // submit deal edit form
  submitDealCreateForm(formData: any): Observable<any> {
    return this.http.post(`${environment.baseUrl}/deals`, formData);
  }
}
