import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Printer } from '../../interfaces/printer.interface';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class PrinterService {
  constructor(private http: HttpClient) { }

  getPrinterName(id: string): Observable<string> {
    return this.http.get<Printer>(`${environment.baseUrl}/printers/${id}`).pipe(
      map((printer: any) => printer.model)
    );
  }
}