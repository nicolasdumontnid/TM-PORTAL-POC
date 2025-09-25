import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AISummary } from '../../../../models/visual-patient.model';

@Component({
  selector: 'app-ai-summary-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="aiSummary$ | async as summary">
      <div class="badges">
        <span class="badge medical-sector">{{summary.medicalSector}}</span>
        <span class="badge status">{{summary.status}}</span>
      </div>
      <p class="summary-text">{{summary.healthSummary}}</p>
    </div>
  `,
  styles: [`
    .badges {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }

    .badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .badge.medical-sector {
      background-color: var(--primary-color);
      color: white;
    }

    .badge.status {
      background-color: var(--online-green);
      color: white;
    }

    .summary-text {
      line-height: 1.6;
      color: var(--text-primary);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiSummaryBlockComponent {
  @Input() aiSummary$!: Observable<AISummary>;
}