import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StudentService } from '../services/student.service';
import { Student, UpdateStudentDto } from '../../../../shared/models/student.model';
import { PlanType, FinancialStatus } from '../../../../shared/models/enums';

@Component({
  selector: 'app-student-edit-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Editar Aluno</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field class="full-width">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>E-mail</mat-label>
          <input matInput formControlName="email" type="email" />
          @if (form.controls.email.hasError('email')) {
            <mat-error>E-mail inválido</mat-error>
          }
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Telefone</mat-label>
          <input matInput formControlName="phone" />
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Mensalidade (R$)</mat-label>
          <input matInput formControlName="monthlyFee" type="number" />
          @if (form.controls.monthlyFee.hasError('min')) {
            <mat-error>Valor mínimo: R$ 0</mat-error>
          }
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Tipo de Plano</mat-label>
          <mat-select formControlName="planType">
            <mat-option [value]="PlanType.PAID">Mensalista</mat-option>
            <mat-option [value]="PlanType.SCHOLARSHIP">Bolsista</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Status Financeiro</mat-label>
          <mat-select formControlName="financialStatus">
            <mat-option [value]="FinancialStatus.ACTIVE">Ativo</mat-option>
            <mat-option [value]="FinancialStatus.PENDING">Pendente</mat-option>
            <mat-option [value]="FinancialStatus.OVERDUE">Inadimplente</mat-option>
            <mat-option [value]="FinancialStatus.CANCELLED">Cancelado</mat-option>
            <mat-option [value]="FinancialStatus.EXEMPT">Isento</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button
        mat-flat-button
        color="primary"
        (click)="onSave()"
        [disabled]="saving() || form.invalid"
      >
        @if (saving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          Salvar
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .full-width { width: 100%; }
    mat-form-field { margin-bottom: 4px; }
    mat-dialog-content { min-width: 350px; }
  `,
})
export class StudentEditDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<StudentEditDialogComponent>);
  private readonly data = inject<{ student: Student }>(MAT_DIALOG_DATA);
  private readonly studentService = inject(StudentService);
  private readonly snackBar = inject(MatSnackBar);

  readonly PlanType = PlanType;
  readonly FinancialStatus = FinancialStatus;
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: [this.data.student.name],
    email: [this.data.student.email || '', [Validators.email]],
    phone: [this.data.student.phone || ''],
    monthlyFee: [this.data.student.monthlyFee, [Validators.min(0)]],
    planType: [this.data.student.planType as PlanType],
    financialStatus: [this.data.student.financialStatus as FinancialStatus],
  });

  onSave(): void {
    if (this.form.invalid) return;

    const formValue = this.form.getRawValue();
    const student = this.data.student;
    const changes: UpdateStudentDto = {};

    if (formValue.name !== student.name) changes.name = formValue.name;
    if (formValue.email !== (student.email || '')) changes.email = formValue.email;
    if (formValue.phone !== (student.phone || '')) changes.phone = formValue.phone;
    if (formValue.monthlyFee !== student.monthlyFee) changes.monthlyFee = formValue.monthlyFee;
    if (formValue.planType !== student.planType) changes.planType = formValue.planType;
    if (formValue.financialStatus !== student.financialStatus)
      changes.financialStatus = formValue.financialStatus;

    if (Object.keys(changes).length === 0) {
      this.dialogRef.close(false);
      return;
    }

    this.saving.set(true);
    this.studentService.update(student._id, changes).subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open('Aluno atualizado com sucesso', 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-success'],
        });
        this.dialogRef.close(true);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }
}
