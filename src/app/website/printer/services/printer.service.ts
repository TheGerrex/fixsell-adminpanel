import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Printer } from '../../interfaces/printer.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PrinterService {
  constructor(private http: HttpClient) {}

  getAllPrinters(): Observable<Printer[]> {
    return this.http
      .get<Printer[]>(`${environment.baseUrl}/printers`)
      .pipe(map((printerResponse) => printerResponse));
  }

  getAllRentablePrinters(): Observable<Printer[]> {
    return this.http
      .get<Printer[]>(`${environment.baseUrl}/printers?rentable=true`)
      .pipe(map((printerResponse) => printerResponse));
  }

  getPrinter(id: string): Observable<Printer> {
    return this.http
      .get<Printer>(`${environment.baseUrl}/printers/${id}`)
      .pipe(map((printerResponse) => printerResponse));
  }

  // get printer id by name
  getPrinterIdByName(name: string): Observable<string> {
    return this.http.get<Printer[]>(`${environment.baseUrl}/printers`).pipe(
      map((printers: Printer[]) => {
        const printer = printers.find((printer) => printer.model === name);
        if (printer) {
          return printer.id;
        } else {
          throw new Error('Printer not found');
        }
      }),
      catchError((err) => {
        console.error(err);
        throw err;
      })
    );
  }

  getPrinterByName(name: string): Observable<Printer> {
    let params = new HttpParams().append('model', name);
    return this.http.get<Printer[]>(`${environment.baseUrl}/printers`, { params }).pipe(
      map((printers: Printer[]) => {
        const printer = printers[0];
        if (printer) {
          return printer;
        } else {
          throw new Error('Multifuncional no encontrada');
        }
      }),
      catchError((err) => {
        console.error(err);
        throw err;
      })
    );
  }

  deletePrinter(id: string): Observable<Printer> {
    return this.http
      .delete<Printer>(`${environment.baseUrl}/printers/${id}`)
      .pipe(map((printerResponse) => printerResponse));
  }

  getPrinterName(id: string): Observable<string> {
    return this.http
      .get<Printer>(`${environment.baseUrl}/printers/${id}`)
      .pipe(map((printer: Printer) => printer.model));
  }

  submitPrinterEditForm(data: Printer, id: string) {
    const formData = data;
    console.log('formData:', formData);
    console.log(`${environment.baseUrl}/printers/${id}`);
    return this.http
      .patch(`${environment.baseUrl}/printers/${id}`, formData)
      .pipe(
        catchError((error) => {
          console.error('Error:', error);
          return throwError(error);
        })
      );
  }

  submitPrinterCreateForm(data: Printer): Observable<Printer> {
    const formData = data;
    console.log('formData:', formData);
    console.log(`${environment.baseUrl}/printers`);
    return this.http
      .post<Printer>(`${environment.baseUrl}/printers`, formData)
      .pipe(
        catchError((error) => {
          console.error('Error:', error);
          return throwError(error);
        })
      );
  }

  // get brands from printers
  getBrands(): Observable<string[]> {
    return this.http
      .get<{ name: string }[]>(`${environment.baseUrl}/brands/printers`)
      .pipe(
        map((brands: { name: string }[]) => brands.map((brand) => brand.name)),
        map((brandNames: string[]) =>
          brandNames.filter(
            (brandName, index, self) => self.indexOf(brandName) === index
          )
        )
      );
  }

  // get categories from printers
  getCategories(): Observable<string[]> {
    return this.http
      .get<{ name: string }[]>(`${environment.baseUrl}/categories/printers`)
      .pipe(
        map((categories: { name: string }[]) =>
          categories.map((category) => category.name)
        ),
        map((categoryNames: string[]) =>
          categoryNames.filter(
            (categoryName, index, self) => self.indexOf(categoryName) === index
          )
        )
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
}
