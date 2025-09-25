import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { PatientRecord } from '../../../../models/visual-patient.model';

@Component({
  selector: 'app-patient-records-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="badges">
      <span 
        class="badge filter-badge"
        [class.active]="recordsFilter$ | async === 'All'"
        (click)="onFilterChange('All')"
      >All</span>
      <span 
        class="badge filter-badge"
        [class.active]="recordsFilter$ | async === 'Imaging'"
        (click)="onFilterChange('Imaging')"
      >Imaging</span>
      <span 
        class="badge filter-badge"
        [class.active]="recordsFilter$ | async === 'Lab'"
        (click)="onFilterChange('Lab')"
      >Lab</span>
      <span 
        class="badge filter-badge"
        [class.active]="recordsFilter$ | async === 'Reports'"
        (click)="onFilterChange('Reports')"
      >Reports</span>
    </div>
    <div class="records-list">
      <div *ngFor="let record of filteredPatientRecords$ | async" class="record-item">
        <div class="record-header">
          <span class="record-date">{{record.date | date:'dd/MM/yyyy'}}</span>
          <span class="record-name">{{record.examName}}</span>
        </div>
        <p class="record-description">{{record.description}}</p>
      </div>
    </div>
    <div class="block-footer">
      <button class="see-all-btn">see all -></button>
    </div>
  `,
  styles: [`
    .badges {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }

    .badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .badge.filter-badge {
      background-color: var(--bg-main);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .badge.filter-badge:hover {
      background-color: var(--border-color);
    }

    .badge.filter-badge.active {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .records-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .record-item {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 10px;
      background-color: var(--bg-main);
    }

    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .record-date {
      font-weight: 600;
      color: var(--text-primary);
    }

    .record-name {
      font-weight: 500;
      color: var(--primary-color);
    }

    .record-description {
      color: var(--text-secondary);
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .block-footer {
      text-align: center;
      padding: 15px 20px;
      border-top: 1px solid var(--border-color);
      background-color: var(--bg-main);
    }

    .see-all-btn {
      background: none;
      border: none;
      color: var(--primary-color);
      cursor: pointer;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 6px;
      transition: background-color 0.2s ease;
    }

    .see-all-btn:hover {
      background-color: var(--primary-light);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientRecordsBlockComponent {
  @Input() filteredPatientRecords$!: Observable<PatientRecord[]>;
  @Input() recordsFilter$!: Observable<string>;
  @Output() filterChange = new EventEmitter<string>();

  onFilterChange(filter: string): void {
    this.filterChange.emit(filter);
  }
}