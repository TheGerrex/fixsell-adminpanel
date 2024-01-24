import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Printer } from '../../interfaces/printer.interface';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root',
})
export class PrinterService {
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

  //create deal for printer by name
  createDealForPrinterByName(name: string, deal: any): Observable<any> {
    return this.findPrinterIdByName(name).pipe(
      tap((id) => {
        if (id) {
          this.http
            .post(`${environment.baseUrl}/printers/${id}/deal`, deal)
            .subscribe();
        }
      })
    );
  }
}
