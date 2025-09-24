import { Component, ChangeDetectionStrategy, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ExamService } from '../../../services/exam.service';
import { Exam } from '../../../models/exam.model';
import { ExamItemComponent } from './exam-item/exam-item.component';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule, ExamItemComponent],
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamListComponent implements OnInit {
  @Output() examDoubleClick = new EventEmitter<string>();
  exams$!: Observable<Exam[]>;

  constructor(private examService: ExamService) {}

  ngOnInit(): void {
    this.exams$ = this.examService.getAll();
  }

  trackByExamId(index: number, exam: Exam): string {
    return exam.id;
  }

  onExamDoubleClick(examId: string): void {
    this.examDoubleClick.emit(examId);
  }
}