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
export class PackageService {
  constructor(private http: HttpClient) {}
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
  createPackageForPrinterByName(name: string, deal: any): Observable<any> {
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

  deletePackageById(id: number): Observable<any> {
    return this.http.delete(`${environment.baseUrl}/packages/${id}`, {
      responseType: 'text',
    });
  }
}
