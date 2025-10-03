import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exam } from '../../../../models/exam.model';
import { ExamService } from '../../../../services/exam.service';
import { NavigationService } from '../../../../services/navigation.service';

@Component({
  selector: 'app-exam-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-item.component.html',
  styleUrl: './exam-item.component.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class ExamItemComponent {
  @Input() exam!: Exam;

  constructor(
    private examService: ExamService,
    private navigationService: NavigationService
  ) {}

  toggleExpansion(): void {
    this.examService.update(this.exam.id, { isExpanded: !this.exam.isExpanded }).subscribe();
  }

  togglePin(): void {
    this.examService.update(this.exam.id, { isPinned: !this.exam.isPinned }).subscribe();
  }

  getAiButtonClass(): string {
    switch (this.exam.aiStatus) {
      case 'green': return 'green';
      case 'red': return 'red';
      case 'orange': return 'orange';
      default: return 'green';
    }
  }

  openReporting(): void {
    this.examService.selectExam(this.exam);
    this.navigationService.triggerNavigationChange('reporting');
  }
}