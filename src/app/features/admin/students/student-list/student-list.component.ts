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
import { MatSelectModule } from '@angular/material/select';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentService } from '../services/student.service';
import { Student } from '../../../../shared/models/student.model';
import { CpfPipe } from '../../../../shared/pipes/cpf.pipe';
import { FinancialStatusBadgeComponent } from '../../../../shared/components/financial-status-badge/financial-status-badge.component';
import { PlanType, FinancialStatus } from '../../../../shared/models/enums';

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
    MatSelectModule,
    CpfPipe,
    FinancialStatusBadgeComponent,
  ],
  template: `
    <h2>Alunos</h2>

    <div class="filters-row">
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

      <mat-form-field class="filter-field">
        <mat-label>Ativo</mat-label>
        <mat-select [ngModel]="filterActive()" (ngModelChange)="onFilterActiveChange($event)">
          <mat-option value="">Todos</mat-option>
          <mat-option value="true">Sim</mat-option>
          <mat-option value="false">Não</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field class="filter-field">
        <mat-label>Plano</mat-label>
        <mat-select [ngModel]="filterPlanType()" (ngModelChange)="onFilterPlanTypeChange($event)">
          <mat-option value="">Todos</mat-option>
          <mat-option [value]="planTypePaid">Mensalista</mat-option>
          <mat-option [value]="planTypeScholarship">Bolsista</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field class="filter-field">
        <mat-label>Status financeiro</mat-label>
        <mat-select [ngModel]="filterFinancialStatus()" (ngModelChange)="onFilterFinancialStatusChange($event)">
          <mat-option value="">Todos</mat-option>
          <mat-option [value]="financialStatusPending">Pendente</mat-option>
          <mat-option [value]="financialStatusActive">Ativo</mat-option>
          <mat-option [value]="financialStatusOverdue">Inadimplente</mat-option>
          <mat-option [value]="financialStatusCancelled">Cancelado</mat-option>
          <mat-option [value]="financialStatusExempt">Isento</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

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
                <span class="status-badge" [class.status-active]="student.active" [class.status-inactive]="!student.active">
                  {{ student.active ? 'Sim' : 'Não' }}
                </span>
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
    .filters-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .search-field {
      flex: 1;
      min-width: 200px;
      max-width: 400px;
    }
    .filter-field {
      width: 160px;
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
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 16px;
      font-weight: 500;
      font-size: 0.875rem;
    }
    .status-active {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    .status-inactive {
      background-color: #ffebee;
      color: #c62828;
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
  readonly filterActive = signal('');
  readonly filterPlanType = signal('');
  readonly filterFinancialStatus = signal('');
  readonly loading = signal(false);

  readonly planTypePaid = PlanType.PAID;
  readonly planTypeScholarship = PlanType.SCHOLARSHIP;
  readonly financialStatusPending = FinancialStatus.PENDING;
  readonly financialStatusActive = FinancialStatus.ACTIVE;
  readonly financialStatusOverdue = FinancialStatus.OVERDUE;
  readonly financialStatusCancelled = FinancialStatus.CANCELLED;
  readonly financialStatusExempt = FinancialStatus.EXEMPT;

  constructor() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => {
        this.pageIndex.set(0);
        this.loadStudents();
      });
  }

  ngOnInit(): void {
    this.loadStudents();
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.searchSubject.next('');
  }

  onFilterActiveChange(value: string): void {
    this.filterActive.set(value);
    this.pageIndex.set(0);
    this.loadStudents();
  }

  onFilterPlanTypeChange(value: string): void {
    this.filterPlanType.set(value);
    this.pageIndex.set(0);
    this.loadStudents();
  }

  onFilterFinancialStatusChange(value: string): void {
    this.filterFinancialStatus.set(value);
    this.pageIndex.set(0);
    this.loadStudents();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadStudents();
  }

  onRowClick(student: Student): void {
    this.router.navigate(['/admin/alunos', student._id]);
  }

  private loadStudents(): void {
    this.loading.set(true);
    const active = this.filterActive();
    const planType = this.filterPlanType();
    const financialStatus = this.filterFinancialStatus();
    const filters =
      active !== '' || planType !== '' || financialStatus !== ''
        ? { active: active || undefined, planType: planType || undefined, financialStatus: financialStatus || undefined }
        : undefined;
    this.studentService
      .search(this.searchTerm(), this.pageIndex() + 1, this.pageSize(), filters)
      .subscribe({
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
