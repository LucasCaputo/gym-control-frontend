import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Role } from '../../shared/models/enums';

interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  name: string;
  exp: number;
}

const TOKEN_KEY = 'access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);

  login(email: string, password: string): Observable<void> {
    return this.http
      .post<ApiResponse<{ accessToken: string }>>(`${environment.apiBaseUrl}/admin/auth/login`, {
        email,
        password,
      })
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Erro ao fazer login');
          }
          this.storage.set(TOKEN_KEY, response.data.accessToken);
        }),
      );
  }

  logout(): void {
    this.storage.remove(TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.storage.get(TOKEN_KEY);
  }

  getUser(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload as JwtPayload;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const user = this.getUser();
    if (!user) return false;
    return user.exp * 1000 > Date.now();
  }

  hasRole(role: Role): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  redirectByRole(): void {
    const user = this.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    if (user.role === Role.ADMIN) {
      this.router.navigate(['/admin/dashboard']);
    } else if (user.role === Role.CHECKIN) {
      this.router.navigate(['/checkin']);
    }
  }
}
