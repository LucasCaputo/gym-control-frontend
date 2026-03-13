import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../../../../shared/models/api-response.model';
import { PaymentHistory } from '../../../../shared/models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);

  getStudentPayments(
    studentId: string,
    page = 1,
    limit = 20,
  ): Observable<PaginatedResponse<PaymentHistory>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http
      .get<ApiResponse<PaginatedResponse<PaymentHistory>>>(
        `${environment.apiBaseUrl}/admin/payments/student/${studentId}`,
        { params },
      )
      .pipe(map((res) => res.data!));
  }

  createSubscription(studentId: string): Observable<{ checkoutUrl: string }> {
    return this.http
      .post<ApiResponse<{ checkoutUrl: string }>>(
        `${environment.apiBaseUrl}/admin/payments/create-subscription`,
        { studentId },
      )
      .pipe(map((res) => res.data!));
  }

  cancelSubscription(studentId: string): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(
        `${environment.apiBaseUrl}/admin/payments/cancel-subscription`,
        { studentId },
      )
      .pipe(map(() => undefined));
  }

  updateCard(studentId: string): Observable<{ checkoutUrl: string }> {
    return this.http
      .post<ApiResponse<{ checkoutUrl: string }>>(
        `${environment.apiBaseUrl}/admin/payments/update-card/${studentId}`,
        {},
      )
      .pipe(map((res) => res.data!));
  }
}
