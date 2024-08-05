import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { Activity } from '../interfaces/tickets.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  constructor(private http: HttpClient) {}

  getAllActivities(): Observable<Activity[]> {
    return this.http
      .get<Activity[]>(`${environment.baseUrl}/activity`)
      .pipe(map((activityResponse) => activityResponse));
  }

  getActivityById(activityId: number): Observable<Activity> {
    return this.http
      .get<Activity>(`${environment.baseUrl}/activity/${activityId}`)
      .pipe(map((activityResponse) => activityResponse));
  }

  createActivity(activity: Omit<Activity, 'id'>): Observable<Activity> {
    return this.http
      .post<Activity>(`${environment.baseUrl}/activity`, activity)
      .pipe(map((activityResponse) => activityResponse));
  }

  updateActivity(activityId: number, activity: Partial<Omit<Activity, 'id'>>): Observable<Activity> {
    console.log('update activity function called');
    console.trace(); // This will output a stack trace
    console.log('updating activity:', activity);
    console.log('submitting activity with id:', activityId);
    return this.http
      .patch<Activity>(`${environment.baseUrl}/activity/${activityId}`, activity)
      .pipe(map((activityResponse) => activityResponse));
  }

  deleteActivity(activityId: number): Observable<any> {
    return this.http
      .delete(`${environment.baseUrl}/activity/${activityId}`, {
        responseType: 'text',
      })
      .pipe(
        tap({
          next: () => console.log('Actividad eliminada correctamente'),
          error: (error) => console.log('Error eliminando actividad:', error),
        })
      );
  }
}
