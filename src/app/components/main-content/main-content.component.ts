import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NavigationService } from '../../services/navigation.service';
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

  private navigationSubscription?: Subscription;

  constructor(private navigationService: NavigationService) {}

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

  onExamDoubleClick(): void {
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
    this.showDashboardSubject.next(false);
    // Reset to inbox when closing dashboard
    this.navigationService.setActiveNavItem('inbox');
    this.navigationService.triggerNavigationChange('inbox');
  }
}