import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NavigationService } from '../../services/navigation.service';
import { ExamService } from '../../services/exam.service';
import { ConfigService } from '../../services/config.service';
import { ThemeService } from '../../services/theme.service';
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
  private reportingWindow: Window | null = null;
  private viewerWindow: Window | null = null;

  constructor(
    private navigationService: NavigationService,
    private examService: ExamService,
    private configService: ConfigService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Open reporting and viewer windows on startup
    this.openEmptyReportingWindow();
    this.openEmptyViewerWindow();

    // Listen to navigation changes
    this.navigationSubscription = this.navigationService.getNavigationChange().subscribe(itemId => {
      // Hide all special views when navigating to any navigation item
      this.showDashboardSubject.next(false);
      this.showVisualPatientSubject.next(false);
      this.selectedExamIdSubject.next(null);
    });
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
    
    // Close windows on component destroy
    if (this.reportingWindow && !this.reportingWindow.closed) {
      this.reportingWindow.close();
    }
    if (this.viewerWindow && !this.viewerWindow.closed) {
      this.viewerWindow.close();
    }
  }

  private openEmptyReportingWindow(): void {
    this.configService.getReportingWindowConfig().subscribe(windowConfig => {
      const features = `left=${windowConfig.left},top=${windowConfig.top},width=${windowConfig.width},height=${windowConfig.height},resizable=yes,scrollbars=yes`;
      
      this.reportingWindow = window.open('', 'reportingWindow', features);
      
      if (this.reportingWindow) {
        // Apply current theme to the window
        this.themeService.registerReportingWindow(this.reportingWindow);
        
        // Set up the empty content
        this.setupEmptyReportingContent(this.reportingWindow);
        
        // Save position when window is moved or resized
        this.reportingWindow.addEventListener('beforeunload', () => {
          this.configService.saveReportingWindowPosition(this.reportingWindow!);
        });
      }
    });
  }

  private openEmptyViewerWindow(): void {
    this.configService.getViewerConfig().subscribe(viewerConfig => {
      const features = `left=${viewerConfig.window.left},top=${viewerConfig.window.top},width=${viewerConfig.window.width},height=${viewerConfig.window.height},resizable=yes,scrollbars=yes`;
      
      this.viewerWindow = window.open('', 'viewerWindow', features);
      
      if (this.viewerWindow) {
        // Apply current theme to the window
        this.themeService.registerViewerWindow(this.viewerWindow);
        
        // Set up the empty content
        this.setupEmptyViewerContent(this.viewerWindow);
      }
    });
  }

  private setupEmptyReportingContent(window: Window): void {
    const currentTheme = this.themeService.currentThemeValue;
    
    window.document.write(`
      <!DOCTYPE html>
      <html lang="en" data-theme="${currentTheme}">
      <head>
        <title>Telemis Portal - Reporting</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          :root {
            /* Light Theme (Default) */
            --primary-color: #14B8A6;
            --primary-light: #F0FDFA;
            --bg-main: #F7F8FA;
            --bg-container: #FFFFFF;
            --border-color: #EAEBEE;
            --text-primary: #2C3E50;
            --text-secondary: #7F8C9A;
          }

          html[data-theme="dark"] {
            --primary-light: rgba(20, 184, 166, 0.1);
            --bg-main: #1A202C;
            --bg-container: #2D3748;
            --border-color: #4A5568;
            --text-primary: #EDF2F7;
            --text-secondary: #A0AEC0;
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg-main);
            color: var(--text-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            transition: background-color 0.3s ease, color 0.3s ease;
          }

          .empty-container {
            text-align: center;
            padding: 40px;
            background-color: var(--bg-container);
            border-radius: 12px;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 90%;
            transition: background-color 0.3s ease, border-color 0.3s ease;
          }

          .icon {
            font-size: 4rem;
            color: var(--primary-color);
            margin-bottom: 20px;
          }

          h1 {
            color: var(--text-primary);
            font-size: 1.5rem;
            margin-bottom: 10px;
            font-weight: 600;
          }

          p {
            color: var(--text-secondary);
            font-size: 1rem;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="empty-container">
          <div class="icon">📋</div>
          <h1>Reporting Module</h1>
          <p>Waiting for content...</p>
        </div>
      </body>
      </html>
    `);
    window.document.close();
  }

  private setupEmptyViewerContent(window: Window): void {
    const currentTheme = this.themeService.currentThemeValue;
    
    window.document.write(`
      <!DOCTYPE html>
      <html lang="en" data-theme="${currentTheme}">
      <head>
        <title>Telemis Portal - Viewer</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          :root {
            /* Light Theme (Default) */
            --primary-color: #14B8A6;
            --primary-light: #F0FDFA;
            --bg-main: #F7F8FA;
            --bg-container: #FFFFFF;
            --border-color: #EAEBEE;
            --text-primary: #2C3E50;
            --text-secondary: #7F8C9A;
          }

          html[data-theme="dark"] {
            --primary-light: rgba(20, 184, 166, 0.1);
            --bg-main: #1A202C;
            --bg-container: #2D3748;
            --border-color: #4A5568;
            --text-primary: #EDF2F7;
            --text-secondary: #A0AEC0;
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg-main);
            color: var(--text-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            transition: background-color 0.3s ease, color 0.3s ease;
          }

          .empty-container {
            text-align: center;
            padding: 40px;
            background-color: var(--bg-container);
            border-radius: 12px;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 90%;
            transition: background-color 0.3s ease, border-color 0.3s ease;
          }

          .icon {
            font-size: 4rem;
            color: var(--primary-color);
            margin-bottom: 20px;
          }

          h1 {
            color: var(--text-primary);
            font-size: 1.5rem;
            margin-bottom: 10px;
            font-weight: 600;
          }

          p {
            color: var(--text-secondary);
            font-size: 1rem;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="empty-container">
          <div class="icon">🔍</div>
          <h1>Medical Viewer</h1>
          <p>Waiting for content...</p>
        </div>
      </body>
      </html>
    `);
    window.document.close();
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