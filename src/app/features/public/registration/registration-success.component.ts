import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-registration-success',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="success-container">
      <mat-card class="success-card">
        <mat-card-content>
          <div class="success-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <h1>Matrícula Realizada!</h1>
          <p>Sua matrícula foi realizada com sucesso.</p>
          <p>Bem-vindo à Nonada Academia!</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .success-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--mat-sys-surface-container);
    }
    .success-card {
      max-width: 500px;
      padding: 48px 32px;
      text-align: center;
    }
    .success-icon mat-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: #2e7d32;
    }
    h1 {
      color: var(--mat-sys-primary);
      margin: 24px 0 16px;
    }
    p {
      color: var(--mat-sys-on-surface-variant);
      font-size: 16px;
    }
  `,
})
export class RegistrationSuccessComponent {}
