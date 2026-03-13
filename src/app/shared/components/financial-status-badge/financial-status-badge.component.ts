import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { FinancialStatus } from '../../models/enums';

@Component({
  selector: 'app-financial-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatChipsModule],
  template: `
    <mat-chip-set>
      <mat-chip [class]="badgeClass()" highlighted>
        {{ label() }}
      </mat-chip>
    </mat-chip-set>
  `,
  styles: `
    .status-active { --mat-chip-elevated-container-color: #2e7d32; --mat-chip-label-text-color: #fff; }
    .status-pending { --mat-chip-elevated-container-color: #f9a825; --mat-chip-label-text-color: #000; }
    .status-overdue { --mat-chip-elevated-container-color: #c62828; --mat-chip-label-text-color: #fff; }
    .status-cancelled { --mat-chip-elevated-container-color: #757575; --mat-chip-label-text-color: #fff; }
    .status-exempt { --mat-chip-elevated-container-color: #1565c0; --mat-chip-label-text-color: #fff; }
  `,
})
export class FinancialStatusBadgeComponent {
  readonly status = input.required<FinancialStatus>();

  readonly badgeClass = computed(() => {
    const map: Record<FinancialStatus, string> = {
      [FinancialStatus.ACTIVE]: 'status-active',
      [FinancialStatus.PENDING]: 'status-pending',
      [FinancialStatus.OVERDUE]: 'status-overdue',
      [FinancialStatus.CANCELLED]: 'status-cancelled',
      [FinancialStatus.EXEMPT]: 'status-exempt',
    };
    return map[this.status()] || '';
  });

  readonly label = computed(() => {
    const map: Record<FinancialStatus, string> = {
      [FinancialStatus.ACTIVE]: 'Ativo',
      [FinancialStatus.PENDING]: 'Pendente',
      [FinancialStatus.OVERDUE]: 'Inadimplente',
      [FinancialStatus.CANCELLED]: 'Cancelado',
      [FinancialStatus.EXEMPT]: 'Isento',
    };
    return map[this.status()] || this.status();
  });
}
