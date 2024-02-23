import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { Printer } from '../../interfaces/printer.interface';
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';
import { Category } from '../components/printer-tab/categories-crud/categories.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private http: HttpClient) {}

  // get Category
  getCategory(): Observable<Category[]> {
    return this.http
      .get<Category[]>(`${environment.baseUrl}/categories/printers`)
      .pipe(map((category: Category[]) => category));
  }

  // create Category
  createCategory(category: Category): Observable<any> {
    return this.http
      .post(`${environment.baseUrl}/categories/printers`, category)
      .pipe(
        catchError((error) => {
          console.error('Error occurred:', error);
          return of(error);
        })
      );
  }

  // update Category
  updateCategory(category: Category, id: string): Observable<any> {
    return this.http.patch(
      `${environment.baseUrl}/categories/printers/${id}`,
      category
    );
  }

  // delete Category
  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${environment.baseUrl}/categories/printers/${id}`);
  }
}
