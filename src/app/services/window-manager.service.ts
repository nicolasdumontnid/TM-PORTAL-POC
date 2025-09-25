import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class WindowManagerService {
  private reportingWindowSubject = new BehaviorSubject<Window | null>(null);
  private viewerWindowSubject = new BehaviorSubject<Window | null>(null);

  public reportingWindow$ = this.reportingWindowSubject.asObservable();
  public viewerWindow$ = this.viewerWindowSubject.asObservable();

  constructor(
    private configService: ConfigService,
    private themeService: ThemeService
  ) {}

  get reportingWindow(): Window | null {
    return this.reportingWindowSubject.value;
  }

  get viewerWindow(): Window | null {
    return this.viewerWindowSubject.value;
  }

  initializeWindows(): void {
    this.openReportingWindow();
    this.openViewerWindow();
  }

  private openReportingWindow(): void {
    this.configService.getReportingWindowConfig().subscribe(windowConfig => {
      const features = `left=${windowConfig.left},top=${windowConfig.top},width=${windowConfig.width},height=${windowConfig.height},resizable=yes,scrollbars=yes`;
      
      const reportingWindow = window.open('', 'reportingWindow', features);
      
      if (reportingWindow) {
        this.reportingWindowSubject.next(reportingWindow);
        
        // Apply current theme to the window
        this.themeService.registerReportingWindow(reportingWindow);
        
        // Set up the empty content
        this.setupEmptyReportingContent(reportingWindow);
        
        // Save position when window is moved or resized
        reportingWindow.addEventListener('beforeunload', () => {
          this.configService.saveReportingWindowPosition(reportingWindow);
          this.reportingWindowSubject.next(null);
        });
      }
    });
  }

  private openViewerWindow(): void {
    this.configService.getViewerConfig().subscribe(viewerConfig => {
      const features = `left=${viewerConfig.window.left},top=${viewerConfig.window.top},width=${viewerConfig.window.width},height=${viewerConfig.window.height},resizable=yes,scrollbars=yes`;
      
      const viewerWindow = window.open('', 'viewerWindow', features);
      
      if (viewerWindow) {
        this.viewerWindowSubject.next(viewerWindow);
        
        // Apply current theme to the window
        this.themeService.registerViewerWindow(viewerWindow);
        
        // Set up the empty content
        this.setupEmptyViewerContent(viewerWindow);

        // Handle window close
        viewerWindow.addEventListener('beforeunload', () => {
          this.viewerWindowSubject.next(null);
        });
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

  updateReportingContent(content: string): void {
    const reportingWindow = this.reportingWindow;
    if (reportingWindow && !reportingWindow.closed) {
      reportingWindow.document.body.innerHTML = content;
    }
  }

  updateViewerContent(url: string): void {
    const viewerWindow = this.viewerWindow;
    if (viewerWindow && !viewerWindow.closed) {
      viewerWindow.location.href = url;
    }
  }

  closeWindows(): void {
    if (this.reportingWindow && !this.reportingWindow.closed) {
      this.reportingWindow.close();
    }
    if (this.viewerWindow && !this.viewerWindow.closed) {
      this.viewerWindow.close();
    }
  }
}