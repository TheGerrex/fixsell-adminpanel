import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Printer } from '../../interfaces/printer.interface';
import { environment } from 'src/environments/environment';
import { Software } from '../../interfaces/software.interface';

@Injectable({
  providedIn: 'root',
})
export class SoftwareService {
  constructor(private http: HttpClient) {}

  getAllSoftware(): Observable<Software[]> {
    return this.http
      .get<Software[]>(`${environment.baseUrl}/softwares`)
      .pipe(map((softwareResponse) => softwareResponse));
  }

  getSoftware(id: string): Observable<Software> {
    return this.http
      .get<Software>(`${environment.baseUrl}/softwares/${id}`)
      .pipe(map((softwareResponse) => softwareResponse));
  }

  // get software id by name
  getSoftwareIdByName(name: string): Observable<string> {
    return this.http.get<Software[]>(`${environment.baseUrl}/softwares`).pipe(
      map((softwares: Software[]) => {
        // Convert the search name to lowercase
        const searchNameLower = name.toLowerCase();

        // Find software with case-insensitive comparison
        const software = softwares.find(
          (software) => software.name.toLowerCase() === searchNameLower,
        );

        if (software) {
          return software.id;
        } else {
          // If exact match fails, try to find a partial match
          const partialMatch = softwares.find(
            (software) =>
              software.name.toLowerCase().includes(searchNameLower) ||
              searchNameLower.includes(software.name.toLowerCase()),
          );

          if (partialMatch) {
            return partialMatch.id;
          }

          throw new Error('Software not found');
        }
      }),
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }

  getSoftwareByName(name: string): Observable<Software> {
    // Modified to use case-insensitive search directly
    return this.http.get<Software[]>(`${environment.baseUrl}/softwares`).pipe(
      map((softwares: Software[]) => {
        const searchNameLower = name.toLowerCase();

        // Try exact match first (case insensitive)
        const software = softwares.find(
          (sw) => sw.name.toLowerCase() === searchNameLower,
        );

        if (software) {
          return software;
        }

        // Try partial match if exact match fails
        const partialMatch = softwares.find(
          (sw) =>
            sw.name.toLowerCase().includes(searchNameLower) ||
            searchNameLower.includes(sw.name.toLowerCase()),
        );

        if (partialMatch) {
          return partialMatch;
        }

        throw new Error('Software not found');
      }),
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }

  deleteSoftware(id: string): Observable<Software> {
    return this.http
      .delete<Software>(`${environment.baseUrl}/softwares/${id}`)
      .pipe(map((softwareResponse) => softwareResponse));
  }

  getSoftwareName(id: string): Observable<string> {
    return this.http
      .get<Software>(`${environment.baseUrl}/softwares/${id}`)
      .pipe(map((software: Software) => software.name));
  }

  submitSoftwareEditForm(data: Software, id: string) {
    const formData = data;
    console.log('formData:', formData);
    console.log(`${environment.baseUrl}/softwares/${id}`);
    return this.http
      .patch(`${environment.baseUrl}/softwares/${id}`, formData)
      .pipe(
        catchError((error) => {
          console.error('Error:', error);
          return throwError(error);
        }),
      );
  }

  submitSoftwareCreateForm(data: Software): Observable<Software> {
    const formData = data;
    console.log('formData:', formData);
    console.log(`${environment.baseUrl}/softwares`);
    return this.http
      .post<Software>(`${environment.baseUrl}/softwares`, formData)
      .pipe(
        catchError((error) => {
          console.error('Error:', error);
          return throwError(error);
        }),
      );
  }
}
