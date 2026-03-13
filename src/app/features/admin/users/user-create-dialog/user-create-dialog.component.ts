import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminUserService } from '../services/admin-user.service';
import { Role } from '../../../../shared/models/enums';

@Component({
  selector: 'app-user-create-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Novo Usuário</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field class="full-width">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="name" />
          @if (form.controls.name.hasError('required') && form.controls.name.touched) {
            <mat-error>Nome é obrigatório</mat-error>
          }
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>E-mail</mat-label>
          <input matInput formControlName="email" type="email" />
          @if (form.controls.email.hasError('required') && form.controls.email.touched) {
            <mat-error>E-mail é obrigatório</mat-error>
          }
          @if (form.controls.email.hasError('email') && form.controls.email.touched) {
            <mat-error>E-mail inválido</mat-error>
          }
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Senha</mat-label>
          <input
            matInput
            formControlName="password"
            [type]="hidePassword() ? 'password' : 'text'"
          />
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="hidePassword.set(!hidePassword())"
          >
            <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.controls.password.hasError('required') && form.controls.password.touched) {
            <mat-error>Senha é obrigatória</mat-error>
          }
          @if (form.controls.password.hasError('minlength') && form.controls.password.touched) {
            <mat-error>Mínimo 8 caracteres</mat-error>
          }
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Perfil</mat-label>
          <mat-select formControlName="role">
            <mat-option [value]="Role.ADMIN">Administrador</mat-option>
            <mat-option [value]="Role.CHECKIN">Check-in</mat-option>
          </mat-select>
          @if (form.controls.role.hasError('required') && form.controls.role.touched) {
            <mat-error>Perfil é obrigatório</mat-error>
          }
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
          Criar
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
export class UserCreateDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<UserCreateDialogComponent>);
  private readonly adminUserService = inject(AdminUserService);
  private readonly snackBar = inject(MatSnackBar);

  readonly Role = Role;
  readonly hidePassword = signal(true);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: [Role.CHECKIN as Role, [Validators.required]],
  });

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.adminUserService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open('Usuário criado com sucesso', 'Fechar', {
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
