import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { PatientRecord } from '../../../../models/visual-patient.model';

@Component({
  selector: 'app-patient-records-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-records-block.component.html',
  styleUrl: './patient-records-block.component.css',
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