import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { SidebarComponent } from './app/components/sidebar/sidebar.component';
import { MainContentComponent } from './app/components/main-content/main-content.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SidebarComponent, MainContentComponent],
  template: `
    <div class="app-container">
      <app-sidebar [collapsed]="(sidebarCollapsed$ | async) ?? false"></app-sidebar>
      <app-main-content (examDoubleClick)="onExamDoubleClick()"></app-main-content>
    </div>
  `,
})
export class App {
  title = 'Telemis Portal';
  
  private sidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  sidebarCollapsed$ = this.sidebarCollapsedSubject.asObservable();

  onExamDoubleClick(): void {
    this.sidebarCollapsedSubject.next(true);
  }
}

bootstrapApplication(App);