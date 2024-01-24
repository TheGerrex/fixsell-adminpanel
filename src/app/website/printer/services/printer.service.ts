import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Printer } from '../../interfaces/printer.interface';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class PrinterService {
  constructor(private http: HttpClient) { }

  getPrinter(id: string): Observable<Printer> {
    return this.http.get<Printer>(`${environment.baseUrl}/printers/${id}`)
      .pipe(
        map(printerResponse => printerResponse)
      );
  }

  getPrinterName(id: string): Observable<string> {
    return this.http.get<Printer>(`${environment.baseUrl}/printers/${id}`).pipe(
      map((printer: Printer) => printer.model)
    );
  }
  
  submitPrinterEditForm(data: Printer, id: string) {
    const formData = data;
    console.log('formData:', formData);
    console.log(`${environment.baseUrl}/printers/${id}`);
    return this.http.patch(`${environment.baseUrl}/printers/${id}`, formData).pipe(
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }
}