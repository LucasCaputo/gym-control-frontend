import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        class="sidenav"
      >
        <mat-nav-list>
          <a
            mat-list-item
            routerLink="/admin/dashboard"
            routerLinkActive="active-link"
            (click)="closeMobileSidenav()"
          >
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a
            mat-list-item
            routerLink="/admin/alunos"
            routerLinkActive="active-link"
            (click)="closeMobileSidenav()"
          >
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Alunos</span>
          </a>
          <a
            mat-list-item
            routerLink="/admin/usuarios"
            routerLinkActive="active-link"
            (click)="closeMobileSidenav()"
          >
            <mat-icon matListItemIcon>admin_panel_settings</mat-icon>
            <span matListItemTitle>Usuários</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          @if (isMobile()) {
            <button mat-icon-button (click)="sidenav.toggle()">
              <mat-icon>menu</mat-icon>
            </button>
          }
          <span>Nonada Academia</span>
          <span class="spacer"></span>
          <span class="user-name">{{ userName() }}</span>
          <button mat-icon-button (click)="logout()" matTooltip="Sair">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>

        <div class="content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .sidenav-container {
      height: 100vh;
    }
    .sidenav {
      width: 250px;
    }
    .content {
      padding: 24px;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .user-name {
      margin-right: 8px;
      font-size: 14px;
    }
    .active-link {
      --mat-list-active-indicator-color: var(--mat-sys-primary-container);
    }
    mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }
  `,
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly sidenavRef = viewChild<MatSidenav>('sidenav');

  private readonly isMobile$ = this.breakpointObserver
    .observe([Breakpoints.Handset])
    .pipe(map((result) => result.matches));

  readonly isMobile = toSignal(this.isMobile$, { initialValue: false });

  readonly userName = computed(() => {
    const user = this.authService.getUser();
    return user?.name || '';
  });

  logout(): void {
    this.authService.logout();
  }

  closeMobileSidenav(): void {
    if (this.isMobile()) {
      this.sidenavRef()?.close();
    }
  }
}
