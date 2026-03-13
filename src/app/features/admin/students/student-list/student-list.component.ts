import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentService } from '../services/student.service';
import { Student } from '../../../../shared/models/student.model';
import { CpfPipe } from '../../../../shared/pipes/cpf.pipe';
import { FinancialStatusBadgeComponent } from '../../../../shared/components/financial-status-badge/financial-status-badge.component';

@Component({
  selector: 'app-student-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    CpfPipe,
    FinancialStatusBadgeComponent,
  ],
  template: `
    <h2>Alunos</h2>

    <mat-form-field class="search-field">
      <mat-label>Buscar por nome ou CPF</mat-label>
      <mat-icon matPrefix>search</mat-icon>
      <input
        matInput
        [ngModel]="searchTerm()"
        (ngModelChange)="onSearchChange($event)"
        placeholder="Digite para buscar..."
      />
      @if (searchTerm()) {
        <button mat-icon-button matSuffix (click)="clearSearch()">
          <mat-icon>close</mat-icon>
        </button>
      }
    </mat-form-field>

    @if (loading()) {
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    } @else {
      @if (students().length === 0) {
        <div class="empty-state">
          <mat-icon>people_outline</mat-icon>
          <p>Nenhum aluno encontrado</p>
        </div>
      } @else {
        <div class="table-container">
          <table mat-table [dataSource]="students()">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nome</th>
              <td mat-cell *matCellDef="let student">{{ student.name }}</td>
            </ng-container>

            <ng-container matColumnDef="cpf">
              <th mat-header-cell *matHeaderCellDef>CPF</th>
              <td mat-cell *matCellDef="let student">{{ student.cpf | cpf }}</td>
            </ng-container>

            <ng-container matColumnDef="planType">
              <th mat-header-cell *matHeaderCellDef>Plano</th>
              <td mat-cell *matCellDef="let student">
                {{ student.planType === 'SCHOLARSHIP' ? 'Bolsista' : 'Mensalista' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="financialStatus">
              <th mat-header-cell *matHeaderCellDef>Status Financeiro</th>
              <td mat-cell *matCellDef="let student">
                <app-financial-status-badge [status]="student.financialStatus" />
              </td>
            </ng-container>

            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef>Ativo</th>
              <td mat-cell *matCellDef="let student">
                {{ student.active ? 'Sim' : 'Não' }}
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: displayedColumns"
              class="clickable-row"
              (click)="onRowClick(row)"
            ></tr>
          </table>
        </div>

        <mat-paginator
          [length]="totalStudents()"
          [pageSize]="pageSize()"
          [pageIndex]="pageIndex()"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons
        />
      }
    }
  `,
  styles: `
    h2 {
      color: var(--mat-sys-primary);
    }
    .search-field {
      width: 100%;
      max-width: 400px;
      margin-bottom: 16px;
    }
    .table-container {
      overflow-x: auto;
    }
    table {
      width: 100%;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
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
    .clickable-row {
      cursor: pointer;
    }
    .clickable-row:hover {
      background-color: var(--mat-sys-surface-variant);
    }
  `,
})
export class StudentListComponent implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly router = inject(Router);
  private readonly searchSubject = new Subject<string>();

  readonly displayedColumns = ['name', 'cpf', 'planType', 'financialStatus', 'active'];
  readonly students = signal<Student[]>([]);
  readonly totalStudents = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);
  readonly searchTerm = signal('');
  readonly loading = signal(false);

  constructor() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => {
        this.pageIndex.set(0);
        this.loadStudents(term);
      });
  }

  ngOnInit(): void {
    this.loadStudents('');
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.searchSubject.next('');
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadStudents(this.searchTerm());
  }

  onRowClick(student: Student): void {
    this.router.navigate(['/admin/alunos', student._id]);
  }

  private loadStudents(q: string): void {
    this.loading.set(true);
    this.studentService.search(q, this.pageIndex() + 1, this.pageSize()).subscribe({
      next: (response) => {
        this.students.set(response.data);
        this.totalStudents.set(response.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
