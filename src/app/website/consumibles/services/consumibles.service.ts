import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { Consumible } from '../../interfaces/consumibles.interface';
import { environment } from 'src/environments/environments';
import { of } from 'rxjs';
import { throwError } from 'rxjs';
import { Printer } from '../../interfaces/printer.interface';

@Injectable({
  providedIn: 'root',
})
export class ConsumiblesService {
  constructor(private http: HttpClient) {}

  //get all consumibles
  getAllConsumibles(): Observable<Consumible[]> {
    return this.http.get<Consumible[]>(`${environment.baseUrl}/consumibles`);
  }

  //get consumible by id
  getConsumible(id: string): Observable<Consumible> {
    console.log('getting consumible' + id);
    console.log(`${environment.baseUrl}/consumibles/${id}`);

    return this.http
      .get<Consumible>(`${environment.baseUrl}/consumibles/${id}`)
      .pipe(map((consumibleResponse) => consumibleResponse));
  }

  //create consumible
  createConsumible(consumible: Consumible): Observable<any> {
    return this.http
      .post(`${environment.baseUrl}/consumibles`, consumible)
      .pipe(
        catchError((error) => {
          console.error('Error occurred:', error);
          return throwError(error);
        })
      );
  }
  //update consumible
  updateConsumible(consumible: Consumible, id: string): Observable<any> {
    return this.http.patch(
      `${environment.baseUrl}/consumibles/${id}`,
      consumible
    );
  }

  // get all printer names
  //get all printer names
  getAllPrinterNames(): Observable<string[]> {
    return this.http
      .get<Printer[]>(`${environment.baseUrl}/printers`)
      .pipe(
        map((printers: Printer[]) => printers.map((printer) => printer.model))
      );
  }

  //get printer id by name
  getPrinterIdByName(name: string): Observable<string> {
    return this.http.get<Printer[]>(`${environment.baseUrl}/printers`).pipe(
      map((printers: Printer[]) => {
        const printer = printers.find((printer) => printer.model === name);
        return printer ? printer.id : '';
      })
    );
  }

  deleteImagePrinter(imageUrl: string): Observable<any> {
    return this.http
      .delete(`${environment.baseUrl}/upload/file`, { body: { url: imageUrl } })
      .pipe(
        catchError((error) => {
          console.error('Error:', error);
          return throwError(error);
        })
      );
  }

  // get consumible id by name
  getConsumibleIdByName(name: string): Observable<string> {
    return this.http
      .get<Consumible[]>(`${environment.baseUrl}/consumibles`)
      .pipe(
        map((consumibles: Consumible[]) => {
          const consumible = consumibles.find(
            (consumible) => consumible.name === name
          );
          return consumible ? consumible.id : '';
        }),
        map((id) => id || '') // provide a default value when id is undefined
      );
  }
}
