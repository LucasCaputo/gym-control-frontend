import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../../shared/models/enums';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as Role[] | undefined;
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const user = authService.getUser();
  if (user && requiredRoles.includes(user.role)) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
