import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../../../shared/models/api-response.model';
import { Checkin } from '../../../shared/models/checkin.model';
import { StudentSearchResult } from '../../../shared/models/student.model';

@Injectable({ providedIn: 'root' })
export class CheckinService {
  private readonly http = inject(HttpClient);

  searchStudents(q: string): Observable<StudentSearchResult[]> {
    const params = new HttpParams().set('q', q);
    return this.http
      .get<ApiResponse<{ data: StudentSearchResult[] }>>(
        `${environment.apiBaseUrl}/students/search`,
        { params },
      )
      .pipe(map((res) => res.data?.data ?? []));
  }

  create(studentId: string): Observable<Checkin> {
    return this.http
      .post<ApiResponse<Checkin>>(`${environment.apiBaseUrl}/checkin`, { studentId })
      .pipe(map((res) => res.data!));
  }

  getHistory(studentId: string, page = 1, limit = 20): Observable<PaginatedResponse<Checkin>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http
      .get<ApiResponse<PaginatedResponse<Checkin>>>(
        `${environment.apiBaseUrl}/checkin/history/${studentId}`,
        { params },
      )
      .pipe(map((res) => res.data!));
  }
}
