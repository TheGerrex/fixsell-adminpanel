import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { Printer } from '../../interfaces/printer.interface';
import { Brand } from '../components/printer-tab/brand-crud/brand.interface';
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  constructor(private http: HttpClient) {}

  // get brands
  getBrands(): Observable<Brand[]> {
    return this.http
      .get<Brand[]>(`${environment.baseUrl}/brands/printers`)
      .pipe(map((brands: Brand[]) => brands));
  }

  // create brand
  createBrand(brand: Brand): Observable<any> {
    return this.http.post(`${environment.baseUrl}/brands/printers`, brand).pipe(
      catchError((error) => {
        console.error('Error occurred:', error);
        return of(error);
      })
    );
  }

  // update brand
  updateBrand(brand: Brand, id: string): Observable<any> {
    return this.http.patch(
      `${environment.baseUrl}/brands/printers/${id}`,
      brand
    );
  }

  // delete brand
  deleteBrand(id: number): Observable<any> {
    return this.http.delete(`${environment.baseUrl}/brands/printers/${id}`);
  }
}
