import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './app/components/sidebar/sidebar.component';
import { MainContentComponent } from './app/components/main-content/main-content.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SidebarComponent, MainContentComponent],
  template: `
    <div class="app-container">
      <app-sidebar></app-sidebar>
      <app-main-content></app-main-content>
    </div>
  `,
})
export class App {
  title = 'Telemis Portal';
}

bootstrapApplication(App);