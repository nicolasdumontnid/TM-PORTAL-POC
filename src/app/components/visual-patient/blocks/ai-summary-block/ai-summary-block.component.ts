import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AISummary } from '../../../../models/visual-patient.model';

@Component({
  selector: 'app-ai-summary-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-summary-block.component.html',
  styleUrl: './ai-summary-block.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiSummaryBlockComponent {
  @Input() aiSummary$!: Observable<AISummary>;
}