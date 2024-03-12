import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  getPrinter(id: string): Observable<Printer> {
    return this.http
      .get<Printer>(`${environment.baseUrl}/printers/${id}`)
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
