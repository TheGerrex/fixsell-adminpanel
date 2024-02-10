import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { Consumible } from '../../interfaces/consumibles.interface';
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';
import { throwError } from 'rxjs';

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
}
