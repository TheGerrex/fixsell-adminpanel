import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class LeadsService {
  constructor(private http: HttpClient) {}
  // Get all leads by vendor
  getLeadsbyVendor(vendorId: string): Observable<any> {
    return this.http
      .get(`${environment.baseUrl}/leads/vendor/${vendorId}`)
      .pipe(map((leadsResponse) => leadsResponse));
  }

  // get all leads
  getAllLeads(): Observable<any> {
    return this.http
      .get(`${environment.baseUrl}/leads`)
      .pipe(map((leadsResponse) => leadsResponse));
  }

  // create lead
  createLead(data: any): Observable<any> {
    return this.http
      .post(`${environment.baseUrl}/leads`, data)
      .pipe(map((leadsResponse) => leadsResponse));
  }
}
