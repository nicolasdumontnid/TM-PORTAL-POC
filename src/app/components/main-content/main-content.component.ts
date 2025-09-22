import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { ContentHeaderComponent } from './content-header/content-header.component';
import { ExamListComponent } from './exam-list/exam-list.component';
import { VisualPatientComponent } from '../visual-patient/visual-patient.component';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule, ContentHeaderComponent, ExamListComponent, VisualPatientComponent, DashboardComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainContentComponent {
  private showVisualPatientSubject = new BehaviorSubject<boolean>(false);
  showVisualPatient$ = this.showVisualPatientSubject.asObservable();
  
  private showDashboardSubject = new BehaviorSubject<boolean>(false);
  showDashboard$ = this.showDashboardSubject.asObservable();

  onExamDoubleClick(): void {
    this.showVisualPatientSubject.next(true);
  }

  onCloseVisualPatient(): void {
    this.showVisualPatientSubject.next(false);
  }
  
  onShowDashboard(): void {
    this.showDashboardSubject.next(true);
    this.showVisualPatientSubject.next(false);
  }
  
  onHideDashboard(): void {
    this.showDashboardSubject.next(false);
  }
}