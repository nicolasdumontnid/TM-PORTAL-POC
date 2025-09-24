import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NavigationService } from '../../services/navigation.service';
import { ExamService } from '../../services/exam.service';
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
export class MainContentComponent implements OnInit, OnDestroy {
  private showVisualPatientSubject = new BehaviorSubject<boolean>(false);
  showVisualPatient$ = this.showVisualPatientSubject.asObservable();
  
  private showDashboardSubject = new BehaviorSubject<boolean>(false);
  showDashboard$ = this.showDashboardSubject.asObservable();

  private selectedExamIdSubject = new BehaviorSubject<string | null>(null);
  selectedExamId$ = this.selectedExamIdSubject.asObservable();

  private navigationSubscription?: Subscription;

  constructor(
    private navigationService: NavigationService,
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    // Listen to navigation changes
    this.navigationSubscription = this.navigationService.getNavigationChange().subscribe(itemId => {
      // Hide all special views when navigating to boxes
      if (['inbox', 'pending', 'second-opinion', 'completed', 'overdue', 'tumor-board', 'remote-site'].includes(itemId)) {
        this.showDashboardSubject.next(false);
        this.showVisualPatientSubject.next(false);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  onExamDoubleClick(examId: string): void {
    this.selectedExamIdSubject.next(examId);
    this.showVisualPatientSubject.next(true);
    this.showDashboardSubject.next(false);
  }

  onCloseVisualPatient(): void {
    this.showVisualPatientSubject.next(false);
  }
  
  onShowDashboard(): void {
    this.navigationService.setActiveNavItem('dashboard');
    this.showDashboardSubject.next(true);
    this.showVisualPatientSubject.next(false);
  }
  
  onHideDashboard(): void {
    console.log('Hiding dashboard and navigating to inbox');
    console.log('Current showDashboard value:', this.showDashboardSubject.value);
    this.showDashboardSubject.next(false);
    console.log('New showDashboard value:', this.showDashboardSubject.value);
    // Set navigation to inbox and trigger exam filter update
    this.navigationService.setActiveNavItem('inbox');
    this.examService.setFilter('inbox');
    this.navigationService.triggerNavigationChange('inbox');
    console.log('Navigation completed to inbox');
  }
}