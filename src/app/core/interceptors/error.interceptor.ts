import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error) => {
      let message = 'Ocorreu um erro inesperado.';

      if (error.status === 429) {
        message = 'Muitas tentativas. Aguarde antes de tentar novamente.';
      } else if (error.error?.error?.message) {
        message = error.error.error.message;
      } else if (error.error?.message) {
        message = error.error.message;
      }

      if (error.status !== 401) {
        snackBar.open(message, 'Fechar', {
          duration: 5000,
          panelClass: ['snackbar-error'],
        });
      }

      return throwError(() => error);
    }),
  );
};
