import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../shared/models/api-response.model';
import { Admin, CreateAdminDto } from '../../../../shared/models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly http = inject(HttpClient);

  list(): Observable<Admin[]> {
    return this.http
      .get<ApiResponse<Admin[]>>(`${environment.apiBaseUrl}/admin/users`)
      .pipe(map((res) => res.data!));
  }

  create(data: CreateAdminDto): Observable<Admin> {
    return this.http
      .post<ApiResponse<Admin>>(`${environment.apiBaseUrl}/admin/users`, data)
      .pipe(map((res) => res.data!));
  }
}
