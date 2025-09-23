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

export interface AppConfig {
  reporting: ReportingConfig;
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
          }
        };
        this.config = defaultConfig;
        return of(defaultConfig);
      })
    );
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
      map(config => config.reporting.window)
    );
  }

  // Method to reload configuration (useful for runtime updates)
  reloadConfig(): Observable<AppConfig> {
    this.config = null;
    return this.loadConfig();
  }
}