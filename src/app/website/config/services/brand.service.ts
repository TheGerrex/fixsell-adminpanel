import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Brand, NewBrand } from '../components/printer-tab/brand-crud/brand.interface';
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  constructor(private http: HttpClient) { }

  // get brands
  getBrands(): Observable<Brand[]> {
    return this.http
      .get<Brand[]>(`${environment.baseUrl}/brands/printers`)
      .pipe(map((brands: Brand[]) => brands));
  }

  // create brand
  createBrand(brand: NewBrand): Observable<any> {
    return this.http.post(`${environment.baseUrl}/brands/printers`, brand).pipe(
      catchError((error) => {
        console.error('Ocurrio Error:', error);
        return of(error);
      })
    );
  }

  // update brand
  updateBrand(brand: Brand, id: number): Observable<any> {
    console.log('brand', brand);
    console.log('id', id);
    return this.http.patch(`${environment.baseUrl}/brands/printers/${id}`, { name: brand.name }).pipe(
      catchError((error) => {
        console.error('Ocurrio Error:', error);
        return throwError(error);
      })
    );
  }

  // delete brand
  deleteBrand(id: number): Observable<any> {
    return this.http.delete(`${environment.baseUrl}/brands/printers/${id}`);
  }
}
