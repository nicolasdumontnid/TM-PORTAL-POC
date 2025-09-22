import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReportingComponent } from './app/components/reporting/reporting.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReportingComponent],
  template: `
    <app-reporting></app-reporting>
  `,
})
export class App {
  title = 'Telemis Portal';
}

bootstrapApplication(App);