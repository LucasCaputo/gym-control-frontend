import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registration-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="error-container">
      <mat-card class="error-card">
        <mat-card-content>
          <div class="error-icon">
            <mat-icon>error</mat-icon>
          </div>
          <h1>Algo deu errado</h1>
          <p>O pagamento ou a conclusão da matrícula não foi finalizada.</p>
          <p class="help-text">
            Procure alguém da academia para resolver a situação. Estamos à disposição para ajudar.
          </p>
          <a mat-flat-button color="primary" routerLink="/matricula">Tentar novamente</a>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .error-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--mat-sys-surface-container);
    }
    .error-card {
      max-width: 500px;
      padding: 48px 32px;
      text-align: center;
    }
    .error-icon mat-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: var(--mat-sys-error, #b3261e);
    }
    h1 {
      color: var(--mat-sys-primary);
      margin: 24px 0 16px;
    }
    p {
      color: var(--mat-sys-on-surface-variant);
      font-size: 16px;
    }
    .help-text {
      margin-top: 24px;
      font-weight: 500;
    }
    a {
      margin-top: 24px;
    }
  `,
})
/** Página de retorno quando o pagamento falha no gateway (ex.: Asaas). URL de redirecionamento: /matricula/erro */
export class RegistrationErrorComponent {}
