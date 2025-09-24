import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme = new BehaviorSubject<'light' | 'dark'>('light');
  private reportingWindows: Window[] = [];
  
  constructor() {
    this.initializeTheme();
  }

  get theme$(): Observable<'light' | 'dark'> {
    return this.currentTheme.asObservable();
  }

  get currentThemeValue(): 'light' | 'dark' {
    return this.currentTheme.value;
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    this.setTheme(savedTheme);
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.currentTheme.next(theme);
    this.syncThemeToReportingWindows(theme);
  }

  registerReportingWindow(window: Window): void {
    this.reportingWindows.push(window);
    // Apply current theme to the new window
    this.syncThemeToWindow(window, this.currentTheme.value);
  }

  unregisterReportingWindow(window: Window): void {
    const index = this.reportingWindows.indexOf(window);
    if (index > -1) {
      this.reportingWindows.splice(index, 1);
    }
  }

  private syncThemeToReportingWindows(theme: 'light' | 'dark'): void {
    // Clean up closed windows
    this.reportingWindows = this.reportingWindows.filter(window => !window.closed);
    
    // Apply theme to all open reporting windows
    this.reportingWindows.forEach(window => {
      this.syncThemeToWindow(window, theme);
    });
  }

  private syncThemeToWindow(window: Window, theme: 'light' | 'dark'): void {
    if (window && !window.closed && window.document) {
      window.document.documentElement.setAttribute('data-theme', theme);
    }
  }
}