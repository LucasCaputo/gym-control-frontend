import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CpfMaskDirective } from '../../../shared/components/cpf-mask/cpf-mask.directive';
import { cpfValidator } from '../../../shared/validators/cpf.validator';
import { stripCpfMask, applyPostalCodeMask } from '../../../shared/utils/cpf.utils';
import { StudentService } from '../../admin/students/services/student.service';
import { PlanType } from '../../../shared/models/enums';

@Component({
  selector: 'app-registration',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CpfMaskDirective,
  ],
  template: `
    <div class="registration-container">
      <div class="registration-header">
        <h1>Nonada Academia</h1>
        <p>Formulário de Matrícula</p>
      </div>

      <mat-stepper linear #stepper class="registration-stepper">
        <!-- Step 1: Personal Data -->
        <mat-step [stepControl]="personalForm" label="Dados Pessoais">
          <form [formGroup]="personalForm">
            <mat-form-field class="full-width">
              <mat-label>Nome completo</mat-label>
              <input matInput formControlName="name" />
              @if (personalForm.controls.name.hasError('required') && personalForm.controls.name.touched) {
                <mat-error>Nome é obrigatório</mat-error>
              }
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>CPF</mat-label>
              <input matInput formControlName="cpf" appCpfMask placeholder="000.000.000-00" />
              @if (personalForm.controls.cpf.hasError('required') && personalForm.controls.cpf.touched) {
                <mat-error>CPF é obrigatório</mat-error>
              }
              @if (personalForm.controls.cpf.hasError('cpf') && personalForm.controls.cpf.touched) {
                <mat-error>CPF deve ter 11 dígitos</mat-error>
              }
              @if (cpfConflict()) {
                <mat-error>CPF já cadastrado</mat-error>
              }
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>E-mail</mat-label>
              <input matInput formControlName="email" type="email" />
              @if (personalForm.controls.email.hasError('email') && personalForm.controls.email.touched) {
                <mat-error>E-mail inválido</mat-error>
              }
            </mat-form-field>

            <div class="form-row">
              <mat-form-field>
                <mat-label>Telefone</mat-label>
                <input matInput formControlName="phone" />
              </mat-form-field>

              <mat-form-field>
                <mat-label>Celular</mat-label>
                <input matInput formControlName="mobilePhone" />
              </mat-form-field>
            </div>

            <div class="step-actions">
              <button mat-flat-button color="primary" matStepperNext>Próximo</button>
            </div>
          </form>
        </mat-step>

        <!-- Step 2: Address -->
        <mat-step [stepControl]="addressForm" label="Endereço" optional>
          <form [formGroup]="addressForm">
            <mat-form-field class="full-width">
              <mat-label>Endereço</mat-label>
              <input matInput formControlName="address" />
            </mat-form-field>

            <div class="form-row">
              <mat-form-field>
                <mat-label>Número</mat-label>
                <input matInput formControlName="addressNumber" />
              </mat-form-field>

              <mat-form-field>
                <mat-label>Complemento</mat-label>
                <input matInput formControlName="complement" />
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field>
                <mat-label>Bairro</mat-label>
                <input matInput formControlName="province" />
              </mat-form-field>

              <mat-form-field>
                <mat-label>CEP</mat-label>
                <input
                  matInput
                  formControlName="postalCode"
                  placeholder="00000-000"
                  (input)="onPostalCodeInput($event)"
                />
              </mat-form-field>
            </div>

            <div class="step-actions">
              <button mat-button matStepperPrevious>Voltar</button>
              <button mat-flat-button color="primary" matStepperNext>Próximo</button>
            </div>
          </form>
        </mat-step>

        <!-- Step 3: Plan -->
        <mat-step [stepControl]="planForm" label="Plano">
          <form [formGroup]="planForm">
            <div class="plan-selection">
              <label>Tipo de Plano</label>
              <mat-radio-group formControlName="planType" class="plan-radio-group">
                <mat-radio-button value="PAID">Mensalista</mat-radio-button>
                <mat-radio-button value="SCHOLARSHIP">Bolsista</mat-radio-button>
              </mat-radio-group>
            </div>

            @if (planForm.controls.planType.value === 'PAID') {
              <mat-form-field class="full-width">
                <mat-label>Mensalidade (R$)</mat-label>
                <input matInput formControlName="monthlyFee" type="number" min="5" />
                @if (planForm.controls.monthlyFee.hasError('required')) {
                  <mat-error>Mensalidade é obrigatória</mat-error>
                }
                @if (planForm.controls.monthlyFee.hasError('min')) {
                  <mat-error>Valor mínimo: R$ 5,00</mat-error>
                }
              </mat-form-field>
            }

            <div class="step-actions">
              <button mat-button matStepperPrevious>Voltar</button>
              <button
                mat-flat-button
                color="primary"
                (click)="onSubmit()"
                [disabled]="loading()"
              >
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  Finalizar Matrícula
                }
              </button>
            </div>
          </form>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: `
    .registration-container {
      max-width: 700px;
      margin: 0 auto;
      padding: 24px 16px;
    }
    .registration-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .registration-header h1 {
      color: var(--mat-sys-primary);
      margin: 0;
    }
    .registration-header p {
      color: var(--mat-sys-on-surface-variant);
      margin: 8px 0 0;
    }
    .full-width {
      width: 100%;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .form-row mat-form-field {
      flex: 1;
    }
    .plan-selection {
      margin-bottom: 24px;
    }
    .plan-selection label {
      display: block;
      margin-bottom: 12px;
      font-weight: 500;
    }
    .plan-radio-group {
      display: flex;
      gap: 24px;
    }
    .step-actions {
      margin-top: 24px;
      display: flex;
      gap: 8px;
    }
    mat-form-field {
      margin-bottom: 4px;
    }
    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `,
})
export class RegistrationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly studentService = inject(StudentService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly cpfConflict = signal(false);

  readonly personalForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    cpf: ['', [Validators.required, cpfValidator]],
    email: ['', [Validators.email]],
    phone: [''],
    mobilePhone: [''],
  });

  readonly addressForm = this.fb.nonNullable.group({
    address: [''],
    addressNumber: [''],
    complement: [''],
    province: [''],
    postalCode: [''],
  });

  readonly planForm = this.fb.nonNullable.group({
    planType: ['PAID' as string, [Validators.required]],
    monthlyFee: [{ value: 100, disabled: false }],
  });

  constructor() {
    this.planForm.controls.planType.valueChanges.subscribe((value) => {
      const feeControl = this.planForm.controls.monthlyFee;
      if (value === PlanType.SCHOLARSHIP) {
        feeControl.setValue(0);
        feeControl.clearValidators();
        feeControl.disable();
      } else {
        feeControl.enable();
        feeControl.setValidators([Validators.required, Validators.min(5)]);
        if (feeControl.value === 0) feeControl.setValue(100);
      }
      feeControl.updateValueAndValidity();
    });
  }

  onPostalCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = applyPostalCodeMask(input.value);
    this.addressForm.controls.postalCode.setValue(input.value.replace(/\D/g, ''));
  }

  onSubmit(): void {
    if (this.personalForm.invalid || this.planForm.invalid) {
      this.personalForm.markAllAsTouched();
      this.planForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.cpfConflict.set(false);

    const personal = this.personalForm.getRawValue();
    const address = this.addressForm.getRawValue();
    const plan = this.planForm.getRawValue();

    const dto = {
      ...personal,
      ...address,
      cpf: stripCpfMask(personal.cpf),
      postalCode: address.postalCode.replace(/\D/g, ''),
      monthlyFee: plan.planType === PlanType.SCHOLARSHIP ? 0 : plan.monthlyFee,
      planType: plan.planType as PlanType,
    };

    this.studentService.register(dto).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (dto.planType === PlanType.PAID && response.checkoutUrl) {
          window.location.href = response.checkoutUrl;
        } else {
          this.router.navigate(['/matricula/sucesso']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.cpfConflict.set(true);
        } else {
          this.snackBar.open(
            'Não foi possível concluir a matrícula. Tente novamente.',
            'Fechar',
            { duration: 8000 }
          );
        }
      },
    });
  }
}
