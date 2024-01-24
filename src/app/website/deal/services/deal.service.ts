import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { Printer } from '../../interfaces/printer.interface';
import { environment } from 'src/environments/environments';
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

  //find printer id by name
  findPrinterIdByName(name: string): Observable<string> {
    return this.http.get<Printer[]>(`${environment.baseUrl}/printers`).pipe(
      map((printers: Printer[]) => {
        const printer = printers.find((printer) => printer.model === name);
        return printer ? printer.id : '';
      })
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

  // delete deal by id
  deleteDealById(id: number): Observable<any> {
    return this.http.delete(`${environment.baseUrl}/deals/${id}`, {
      responseType: 'text',
    });
  }

  // get deal by id
  getDeal(id: string): Observable<any> {
    return this.http.get(`${environment.baseUrl}/deals/${id}`);
  }

  // submit deal edit form
  submitDealEditForm(formData: any, dealId: string): Observable<any> {
    return this.http.patch(`${environment.baseUrl}/deals/${dealId}`, formData);
  }
}
