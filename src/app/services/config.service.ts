import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface WindowConfig {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ReportingConfig {
  window: WindowConfig;
}

export interface ViewerConfig {
  url: string;
  window: WindowConfig;
}

export interface AppConfig {
  reporting: ReportingConfig;
  viewer: ViewerConfig;
  examLimits: ExamLimitsConfig;
}

export interface ExamLimitsConfig {
  inbox: number;
  pending: number;
  secondOpinion: number;
}

export interface ReportingImagesConfig {
  nodule1Baseline: string;
  nodule1Current: string;
  nodule2Baseline: string;
  nodule2Current: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig | null = null;

  constructor() {}

  loadConfig(): Observable<AppConfig> {
    if (this.config) {
      return of(this.config);
    }

    return this.fetchConfig().pipe(
      map(config => {
        this.config = config;
        return config;
      }),
      catchError(error => {
        console.error('Error loading configuration:', error);
        // Return default configuration
        const defaultConfig: AppConfig = {
          reporting: {
            window: {
              left: 100,
              top: 100,
              width: 1200,
              height: 800
            },
            images: {
              nodule1Baseline: "assets/public/images/report/report6.JPG",
              nodule1Current: "assets/public/images/report/report7.JPG",
              nodule2Baseline: "assets/public/images/report/report8.JPG",
              nodule2Current: "assets/public/images/report/report9.JPG"
            }
          },
          viewer: {
            url: "https://viewer.ohif.org/viewer?StudyInstanceUIDs=2.16.840.1.114362.1.11972228.22789312658.616067305.306.2",
            window: {
              left: -7,
              top: 0,
              width: 926,
              height: 1183
            }
          },
          examLimits: {
            inbox: 7,
            pending: 3,
            secondOpinion: 2
          },
          reportingImages: {
            nodule1Baseline: "assets/public/images/report/report6.JPG",
            nodule1Current: "assets/public/images/report/report7.JPG",
            nodule2Baseline: "assets/public/images/report/report8.JPG",
            nodule2Current: "assets/public/images/report/report9.JPG"
          }
        };
        this.config = defaultConfig;
        return of(defaultConfig);
      })
    );
  }

  saveReportingWindowPosition(windowRef: Window): void {
    if (windowRef && !windowRef.closed) {
      // Get current window position and size
      const left = windowRef.screenX || windowRef.screenLeft || 0;
      const top = windowRef.screenY || windowRef.screenTop || 0;
      const width = windowRef.outerWidth || 1200;
      const height = windowRef.outerHeight || 800;
      
      // Save to localStorage
      localStorage.setItem('reporting.window.left', left.toString());
      localStorage.setItem('reporting.window.top', top.toString());
      localStorage.setItem('reporting.window.width', width.toString());
      localStorage.setItem('reporting.window.height', height.toString());
      
      console.log('Window position saved:', { left, top, width, height });
    }
  }
  private fetchConfig(): Observable<AppConfig> {
    return new Observable<AppConfig>(observer => {
      fetch('/assets/config/properties.config')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(config => {
          observer.next(config);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  getReportingWindowConfig(): Observable<WindowConfig> {
    return this.loadConfig().pipe(
      map(config => {
        // Check localStorage for saved window position
        const savedLeft = localStorage.getItem('reporting.window.left');
        const savedTop = localStorage.getItem('reporting.window.top');
        const savedWidth = localStorage.getItem('reporting.window.width');
        const savedHeight = localStorage.getItem('reporting.window.height');
        
        // Use localStorage values if they exist, otherwise use config values
        return {
          left: savedLeft ? parseInt(savedLeft, 10) : config.reporting.window.left,
          top: savedTop ? parseInt(savedTop, 10) : config.reporting.window.top,
          width: savedWidth ? parseInt(savedWidth, 10) : config.reporting.window.width,
          height: savedHeight ? parseInt(savedHeight, 10) : config.reporting.window.height
        };
      })
    );
  }

  getViewerConfig(): Observable<ViewerConfig> {
    return this.loadConfig().pipe(
      map(config => {
        // Use only config values, no localStorage override
        return {
          url: config.viewer.url,
          window: {
            left: config.viewer.window.left,
            top: config.viewer.window.top,
            width: config.viewer.window.width,
            height: config.viewer.window.height
          }
        };
      })
    );
  }

  // Method to reload configuration (useful for runtime updates)
  reloadConfig(): Observable<AppConfig> {
    this.config = null;
    return this.loadConfig();
  }

  getExamLimitsConfig(): Observable<ExamLimitsConfig> {
    return this.loadConfig().pipe(
      map(config => config.examLimits)
    );
  }

  getReportingImagesConfig(): Observable<ReportingImagesConfig> {
    return this.loadConfig().pipe(
      map(config => config.reportingImages)
    );
  }
}