import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../../../../shared/models/api-response.model';
import {
  Student,
  RegisterStudentDto,
  RegisterStudentResponse,
  UpdateStudentDto,
} from '../../../../shared/models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly http = inject(HttpClient);

  search(q: string, page = 1, limit = 20): Observable<PaginatedResponse<Student>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (q) {
      params = params.set('q', q);
    }
    return this.http
      .get<ApiResponse<PaginatedResponse<Student>>>(`${environment.apiBaseUrl}/students/search`, {
        params,
      })
      .pipe(map((res) => res.data!));
  }

  update(id: string, data: UpdateStudentDto): Observable<Student> {
    return this.http
      .patch<ApiResponse<Student>>(`${environment.apiBaseUrl}/admin/students/${id}`, data)
      .pipe(map((res) => res.data!));
  }

  register(data: RegisterStudentDto): Observable<RegisterStudentResponse> {
    return this.http
      .post<ApiResponse<RegisterStudentResponse>>(`${environment.apiBaseUrl}/public/register`, data)
      .pipe(map((res) => res.data!));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete(`${environment.apiBaseUrl}/admin/students/${id}`)
      .pipe(map(() => undefined));
  }
}
