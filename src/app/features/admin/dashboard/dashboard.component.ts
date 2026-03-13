import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StudentService } from '../students/services/student.service';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <h2>Dashboard</h2>

    <div class="dashboard-grid">
      <mat-card class="stat-card">
        <mat-card-content>
          <div class="stat-icon">
            <mat-icon>people</mat-icon>
          </div>
          @if (loadingStudents()) {
            <mat-spinner diameter="24"></mat-spinner>
          } @else {
            <div class="stat-value">{{ totalStudents() }}</div>
          }
          <div class="stat-label">Alunos Ativos</div>
        </mat-card-content>
      </mat-card>

      <mat-card class="action-card">
        <mat-card-content>
          <h3>Ações Rápidas</h3>
          <div class="action-buttons">
            <a mat-stroked-button routerLink="/matricula" target="_blank">
              <mat-icon>person_add</mat-icon> Nova Matrícula
            </a>
            <a mat-stroked-button routerLink="/checkin">
              <mat-icon>fact_check</mat-icon> Check-in
            </a>
            <a mat-stroked-button routerLink="/admin/alunos">
              <mat-icon>people</mat-icon> Ver Alunos
            </a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    h2 {
      color: var(--mat-sys-primary);
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      margin-top: 24px;
    }
    .stat-card {
      text-align: center;
      padding: 24px;
    }
    .stat-icon mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--mat-sys-primary);
    }
    .stat-value {
      font-size: 48px;
      font-weight: 700;
      color: var(--mat-sys-primary);
      margin: 8px 0;
    }
    .stat-label {
      font-size: 16px;
      color: var(--mat-sys-on-surface-variant);
    }
    .action-card {
      padding: 16px;
    }
    .action-card h3 {
      margin: 0 0 16px;
      color: var(--mat-sys-on-surface);
    }
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .action-buttons a {
      justify-content: flex-start;
    }
  `,
})
export class DashboardComponent implements OnInit {
  private readonly studentService = inject(StudentService);

  readonly totalStudents = signal(0);
  readonly loadingStudents = signal(false);

  ngOnInit(): void {
    this.loadingStudents.set(true);
    this.studentService.search('', 1, 1).subscribe({
      next: (response) => {
        this.totalStudents.set(response.total);
        this.loadingStudents.set(false);
      },
      error: () => {
        this.loadingStudents.set(false);
      },
    });
  }
}
