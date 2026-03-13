import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CheckinService } from './services/checkin.service';
import { AuthService } from '../../core/services/auth.service';
import { StudentSearchResult } from '../../shared/models/student.model';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-checkin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="checkin-layout">
      <mat-toolbar color="primary">
        <span>Nonada Academia</span>
        <span class="spacer"></span>
        <span class="user-name">{{ userName() }}</span>
        <button mat-icon-button (click)="logout()">
          <mat-icon>logout</mat-icon>
        </button>
      </mat-toolbar>

      <div class="checkin-content">
        <h2>Registro de Presença</h2>

        <mat-form-field class="search-field">
          <mat-label>Buscar aluno por nome ou CPF</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input
            matInput
            [ngModel]="searchTerm()"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Digite pelo menos 3 caracteres"
            autofocus
            #searchInput
          />
          @if (searchTerm()) {
            <button mat-icon-button matSuffix (click)="clearSearch()">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>

        @if (searching()) {
          <div class="loading-container">
            <mat-spinner diameter="32"></mat-spinner>
          </div>
        }

        @if (students().length > 0) {
          <mat-list class="student-list">
            @for (student of students(); track student.id) {
              <mat-list-item class="student-item" (click)="onStudentClick(student)">
                <mat-icon matListItemIcon>person</mat-icon>
                <span matListItemTitle>{{ student.name }}</span>
              </mat-list-item>
            }
          </mat-list>
        }

        @if (!searching() && searchTerm().length >= 3 && students().length === 0) {
          <div class="empty-state">
            <mat-icon>person_search</mat-icon>
            <p>Nenhum aluno encontrado</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .checkin-layout {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .user-name {
      margin-right: 8px;
      font-size: 14px;
    }
    .checkin-content {
      max-width: 600px;
      margin: 0 auto;
      padding: 32px 16px;
      width: 100%;
    }
    h2 {
      text-align: center;
      color: var(--mat-sys-primary);
      margin-bottom: 24px;
    }
    .search-field {
      width: 100%;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 24px;
    }
    .student-list {
      margin-top: 16px;
    }
    .student-item {
      cursor: pointer;
      border-radius: 8px;
      margin-bottom: 4px;
    }
    .student-item:hover {
      background-color: var(--mat-sys-surface-variant);
    }
    .empty-state {
      text-align: center;
      padding: 48px 16px;
      color: var(--mat-sys-on-surface-variant);
    }
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
  `,
})
export class CheckinComponent {
  private readonly checkinService = inject(CheckinService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  private readonly searchSubject = new Subject<string>();

  readonly searchTerm = signal('');
  readonly students = signal<StudentSearchResult[]>([]);
  readonly searching = signal(false);
  readonly userName = signal(this.authService.getUser()?.name || '');

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        filter((term) => term.length >= 3),
        switchMap((term) => {
          this.searching.set(true);
          return this.checkinService.searchStudents(term);
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (results) => {
          this.students.set(results);
          this.searching.set(false);
        },
        error: () => {
          this.searching.set(false);
        },
      });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    if (value.length < 3) {
      this.students.set([]);
      return;
    }
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.students.set([]);
  }

  onStudentClick(student: StudentSearchResult): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Registrar Presença',
        message: `Registrar presença para ${student.name}?`,
        confirmLabel: 'Registrar',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.checkinService.create(student.id).subscribe({
          next: () => {
            this.snackBar.open(`Presença registrada para ${student.name}`, 'Fechar', {
              duration: 3000,
              panelClass: ['snackbar-success'],
            });
            this.clearSearch();
          },
        });
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
