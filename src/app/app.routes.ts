import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './shared/models/enums';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'matricula',
    loadComponent: () =>
      import('./features/public/registration/registration.component').then(
        (m) => m.RegistrationComponent,
      ),
  },
  {
    path: 'matricula/sucesso',
    loadComponent: () =>
      import('./features/public/registration/registration-success.component').then(
        (m) => m.RegistrationSuccessComponent,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'checkin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.CHECKIN, Role.ADMIN] },
    loadComponent: () =>
      import('./features/checkin/checkin.component').then((m) => m.CheckinComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMIN] },
    loadComponent: () =>
      import('./features/admin/layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent,
      ),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'alunos',
        loadComponent: () =>
          import('./features/admin/students/student-list/student-list.component').then(
            (m) => m.StudentListComponent,
          ),
      },
      {
        path: 'alunos/:id',
        loadComponent: () =>
          import('./features/admin/students/student-detail/student-detail.component').then(
            (m) => m.StudentDetailComponent,
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/admin/users/user-list/user-list.component').then(
            (m) => m.UserListComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
