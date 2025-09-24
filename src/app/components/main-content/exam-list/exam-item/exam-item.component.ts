import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exam } from '../../../../models/exam.model';
import { ExamService } from '../../../../services/exam.service';

@Component({
  selector: 'app-exam-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-item.component.html',
  styleUrl: './exam-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamItemComponent {
  @Input() exam!: Exam;

  constructor(
    private examService: ExamService,
    private cdr: ChangeDetectorRef
  ) {}

  toggleExpansion(): void {
    this.examService.update(this.exam.id, { isExpanded: !this.exam.isExpanded }).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  togglePin(): void {
    this.examService.update(this.exam.id, { isPinned: !this.exam.isPinned }).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  getAiButtonClass(): string {
    switch (this.exam.aiStatus) {
      case 'green': return 'green';
      case 'red': return 'red';
      case 'orange': return 'orange';
      default: return 'green';
    }
  }
}