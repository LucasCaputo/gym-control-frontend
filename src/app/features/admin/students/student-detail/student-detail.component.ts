import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { StudentService } from '../services/student.service';
import { PaymentService } from '../../payments/services/payment.service';
import { CheckinService } from '../../../checkin/services/checkin.service';
import { Student } from '../../../../shared/models/student.model';
import { PaymentHistory } from '../../../../shared/models/payment.model';
import { Checkin } from '../../../../shared/models/checkin.model';
import { CpfPipe } from '../../../../shared/pipes/cpf.pipe';
import { FinancialStatusBadgeComponent } from '../../../../shared/components/financial-status-badge/financial-status-badge.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { StudentEditDialogComponent } from '../student-edit-dialog/student-edit-dialog.component';

@Component({
  selector: 'app-student-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    ClipboardModule,
    CpfPipe,
    FinancialStatusBadgeComponent,
  ],
  template: `
    @if (loading()) {
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    } @else if (student()) {
      <div class="detail-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2>{{ student()!.name }}</h2>
      </div>

      <!-- Student Info Card -->
      <mat-card class="info-card">
        <mat-card-content>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Nome</span>
              <span class="value">{{ student()!.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">CPF</span>
              <span class="value">{{ student()!.cpf | cpf }}</span>
            </div>
            <div class="info-item">
              <span class="label">E-mail</span>
              <span class="value">{{ student()!.email || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Telefone</span>
              <span class="value">{{ student()!.phone || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Plano</span>
              <span class="value">
                {{ student()!.planType === 'SCHOLARSHIP' ? 'Bolsista' : 'Mensalista' }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">Método de Pagamento</span>
              <span class="value">
                {{ student()!.paymentMethod === 'SCHOLARSHIP' ? 'Isento' : 'Cartão' }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">Mensalidade</span>
              <span class="value">R$ {{ student()!.monthlyFee | number: '1.2-2' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Valor Fixado</span>
              <span class="value">R$ {{ student()!.priceLocked | number: '1.2-2' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Status Financeiro</span>
              <span class="value">
                <app-financial-status-badge [status]="student()!.financialStatus" />
              </span>
            </div>
            <div class="info-item">
              <span class="label">Ativo</span>
              <span class="value">{{ student()!.active ? 'Sim' : 'Não' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Matrícula</span>
              <span class="value">{{ student()!.registrationNumber }}</span>
            </div>
            <div class="info-item">
              <span class="label">Cadastrado em</span>
              <span class="value">{{ student()!.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <button mat-stroked-button (click)="openEditDialog()">
            <mat-icon>edit</mat-icon> Editar
          </button>
          @if (student()!.active) {
            <button mat-stroked-button color="warn" (click)="toggleActive()">
              <mat-icon>block</mat-icon> Inativar
            </button>
          } @else {
            <button mat-stroked-button (click)="toggleActive()">
              <mat-icon>check_circle</mat-icon> Ativar
            </button>
          }
          @if (!student()!.asaasSubscriptionId) {
            <button mat-stroked-button (click)="createSubscription()">
              <mat-icon>credit_card</mat-icon> Criar Assinatura
            </button>
          } @else {
            <button mat-stroked-button color="warn" (click)="cancelSubscription()">
              <mat-icon>credit_card_off</mat-icon> Cancelar Assinatura
            </button>
          }
          <button mat-stroked-button (click)="updateCard()">
            <mat-icon>payment</mat-icon> Atualizar Cartão
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Tabs: Payment + Checkin history -->
      <mat-tab-group class="mt-24">
        <mat-tab label="Pagamentos">
          @if (paymentsLoading()) {
            <div class="loading-container">
              <mat-spinner diameter="32"></mat-spinner>
            </div>
          } @else if (payments().length === 0) {
            <div class="empty-state">
              <mat-icon>receipt_long</mat-icon>
              <p>Nenhum pagamento encontrado</p>
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="payments()">
                <ng-container matColumnDef="dueDate">
                  <th mat-header-cell *matHeaderCellDef>Vencimento</th>
                  <td mat-cell *matCellDef="let p">{{ p.dueDate | date: 'dd/MM/yyyy' }}</td>
                </ng-container>
                <ng-container matColumnDef="amount">
                  <th mat-header-cell *matHeaderCellDef>Valor</th>
                  <td mat-cell *matCellDef="let p">R$ {{ p.amount | number: '1.2-2' }}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let p">{{ p.status }}</td>
                </ng-container>
                <ng-container matColumnDef="paidAt">
                  <th mat-header-cell *matHeaderCellDef>Pago em</th>
                  <td mat-cell *matCellDef="let p">
                    {{ p.paidAt ? (p.paidAt | date: 'dd/MM/yyyy HH:mm') : '-' }}
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="paymentColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: paymentColumns"></tr>
              </table>
            </div>
            <mat-paginator
              [length]="paymentsTotal()"
              [pageSize]="paymentsPageSize"
              [pageIndex]="paymentsPage()"
              (page)="onPaymentsPageChange($event)"
              showFirstLastButtons
            />
          }
        </mat-tab>

        <mat-tab label="Presenças">
          @if (checkinsLoading()) {
            <div class="loading-container">
              <mat-spinner diameter="32"></mat-spinner>
            </div>
          } @else if (checkins().length === 0) {
            <div class="empty-state">
              <mat-icon>event_available</mat-icon>
              <p>Nenhuma presença registrada</p>
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="checkins()">
                <ng-container matColumnDef="dateTime">
                  <th mat-header-cell *matHeaderCellDef>Data/Hora</th>
                  <td mat-cell *matCellDef="let c">
                    {{ c.dateTime | date: 'dd/MM/yyyy HH:mm' }}
                  </td>
                </ng-container>
                <ng-container matColumnDef="registeredBy">
                  <th mat-header-cell *matHeaderCellDef>Registrado por</th>
                  <td mat-cell *matCellDef="let c">{{ c.registeredBy }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="checkinColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: checkinColumns"></tr>
              </table>
            </div>
            <mat-paginator
              [length]="checkinsTotal()"
              [pageSize]="checkinsPageSize"
              [pageIndex]="checkinsPage()"
              (page)="onCheckinsPageChange($event)"
              showFirstLastButtons
            />
          }
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: `
    .detail-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    .detail-header h2 {
      margin: 0;
      color: var(--mat-sys-primary);
    }
    .info-card {
      margin-bottom: 24px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .info-item .label {
      font-size: 12px;
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 4px;
    }
    .info-item .value {
      font-size: 14px;
      font-weight: 500;
    }
    mat-card-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 16px !important;
    }
    .table-container {
      overflow-x: auto;
      margin-top: 16px;
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
    .mt-24 {
      margin-top: 24px;
    }
  `,
})
export class StudentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly studentService = inject(StudentService);
  private readonly paymentService = inject(PaymentService);
  private readonly checkinService = inject(CheckinService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly clipboard = inject(Clipboard);

  readonly student = signal<Student | null>(null);
  readonly loading = signal(true);

  readonly payments = signal<PaymentHistory[]>([]);
  readonly paymentsTotal = signal(0);
  readonly paymentsPage = signal(0);
  readonly paymentsLoading = signal(false);
  readonly paymentsPageSize = 20;
  readonly paymentColumns = ['dueDate', 'amount', 'status', 'paidAt'];

  readonly checkins = signal<Checkin[]>([]);
  readonly checkinsTotal = signal(0);
  readonly checkinsPage = signal(0);
  readonly checkinsLoading = signal(false);
  readonly checkinsPageSize = 20;
  readonly checkinColumns = ['dateTime', 'registeredBy'];

  private studentId = '';

  ngOnInit(): void {
    this.studentId = this.route.snapshot.params['id'];
    this.loadStudent();
    this.loadPayments();
    this.loadCheckins();
  }

  goBack(): void {
    this.router.navigate(['/admin/alunos']);
  }

  openEditDialog(): void {
    const dialogRef = this.dialog.open(StudentEditDialogComponent, {
      width: '500px',
      data: { student: this.student() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadStudent();
      }
    });
  }

  toggleActive(): void {
    const student = this.student()!;
    const action = student.active ? 'inativar' : 'ativar';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `${student.active ? 'Inativar' : 'Ativar'} Aluno`,
        message: `Deseja ${action} ${student.name}?`,
        confirmLabel: student.active ? 'Inativar' : 'Ativar',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.studentService.update(this.studentId, { active: !student.active }).subscribe({
          next: () => {
            this.snackBar.open(`Aluno ${action === 'inativar' ? 'inativado' : 'ativado'} com sucesso`, 'Fechar', {
              duration: 3000,
              panelClass: ['snackbar-success'],
            });
            this.loadStudent();
          },
        });
      }
    });
  }

  createSubscription(): void {
    this.paymentService.createSubscription(this.studentId).subscribe({
      next: (response) => {
        this.clipboard.copy(response.checkoutUrl);
        this.snackBar.open('Assinatura criada! URL copiada para a área de transferência.', 'Fechar', {
          duration: 5000,
          panelClass: ['snackbar-success'],
        });
        this.loadStudent();
      },
    });
  }

  cancelSubscription(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancelar Assinatura',
        message: `Deseja cancelar a assinatura de ${this.student()!.name}?`,
        confirmLabel: 'Cancelar Assinatura',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.paymentService.cancelSubscription(this.studentId).subscribe({
          next: () => {
            this.snackBar.open('Assinatura cancelada com sucesso', 'Fechar', {
              duration: 3000,
              panelClass: ['snackbar-success'],
            });
            this.loadStudent();
          },
        });
      }
    });
  }

  updateCard(): void {
    this.paymentService.updateCard(this.studentId).subscribe({
      next: (response) => {
        this.clipboard.copy(response.checkoutUrl);
        this.snackBar.open('URL de atualização de cartão copiada!', 'Fechar', {
          duration: 5000,
          panelClass: ['snackbar-success'],
        });
      },
    });
  }

  onPaymentsPageChange(event: PageEvent): void {
    this.paymentsPage.set(event.pageIndex);
    this.loadPayments();
  }

  onCheckinsPageChange(event: PageEvent): void {
    this.checkinsPage.set(event.pageIndex);
    this.loadCheckins();
  }

  private loadStudent(): void {
    this.loading.set(true);
    this.studentService.search('', 1, 1000).subscribe({
      next: (response) => {
        const found = response.data.find((s) => s._id === this.studentId);
        this.student.set(found || null);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private loadPayments(): void {
    this.paymentsLoading.set(true);
    this.paymentService
      .getStudentPayments(this.studentId, this.paymentsPage() + 1, this.paymentsPageSize)
      .subscribe({
        next: (response) => {
          this.payments.set(response.data);
          this.paymentsTotal.set(response.total);
          this.paymentsLoading.set(false);
        },
        error: () => {
          this.paymentsLoading.set(false);
        },
      });
  }

  private loadCheckins(): void {
    this.checkinsLoading.set(true);
    this.checkinService
      .getHistory(this.studentId, this.checkinsPage() + 1, this.checkinsPageSize)
      .subscribe({
        next: (response) => {
          this.checkins.set(response.data);
          this.checkinsTotal.set(response.total);
          this.checkinsLoading.set(false);
        },
        error: () => {
          this.checkinsLoading.set(false);
        },
      });
  }
}
