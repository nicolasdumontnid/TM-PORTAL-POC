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

export interface OhifViewerConfig {
  url: string;
  window: WindowConfig;
}

export interface AppConfig {
  reporting: ReportingConfig;
  ohifViewer: OhifViewerConfig;
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
            }
          },
          ohifViewer: {
            url: "https://viewer.ohif.org/viewer?StudyInstanceUIDs=2.16.840.1.114362.1.11972228.22789312658.616067305.306.2",
            window: {
              left: 200,
              top: 200,
              width: 1400,
              height: 900
            }
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

  getOhifViewerConfig(): Observable<OhifViewerConfig> {
    return this.loadConfig().pipe(
      map(config => {
        // Check localStorage for saved OHIF viewer window position
        const savedLeft = localStorage.getItem('ohifViewer.window.left');
        const savedTop = localStorage.getItem('ohifViewer.window.top');
        const savedWidth = localStorage.getItem('ohifViewer.window.width');
        const savedHeight = localStorage.getItem('ohifViewer.window.height');
        const savedUrl = localStorage.getItem('ohifViewer.url');
        
        // Use localStorage values if they exist, otherwise use config values
        return {
          url: savedUrl || config.ohifViewer.url,
          window: {
            left: savedLeft ? parseInt(savedLeft, 10) : config.ohifViewer.window.left,
            top: savedTop ? parseInt(savedTop, 10) : config.ohifViewer.window.top,
            width: savedWidth ? parseInt(savedWidth, 10) : config.ohifViewer.window.width,
            height: savedHeight ? parseInt(savedHeight, 10) : config.ohifViewer.window.height
          }
        };
      })
    );
  }

  saveOhifViewerWindowPosition(windowRef: Window): void {
    if (windowRef && !windowRef.closed) {
      // Get current window position and size
      const left = windowRef.screenX || windowRef.screenLeft || 0;
      const top = windowRef.screenY || windowRef.screenTop || 0;
      const width = windowRef.outerWidth || 1400;
      const height = windowRef.outerHeight || 900;
      
      // Save to localStorage
      localStorage.setItem('ohifViewer.window.left', left.toString());
      localStorage.setItem('ohifViewer.window.top', top.toString());
      localStorage.setItem('ohifViewer.window.width', width.toString());
      localStorage.setItem('ohifViewer.window.height', height.toString());
      
      console.log('OHIF Viewer window position saved:', { left, top, width, height });
    }
  }

  // Method to reload configuration (useful for runtime updates)
  reloadConfig(): Observable<AppConfig> {
    this.config = null;
    return this.loadConfig();
  }
}