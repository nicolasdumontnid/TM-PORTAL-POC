import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { PatientInfo } from '../../../../models/visual-patient.model';

@Component({
  selector: 'app-patient-info-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="patientInfo$ | async as patientInfo" class="patient-info">
      <img [src]="patientInfo.photo" [alt]="patientInfo.name" class="patient-photo">
      <div class="patient-details">
        <div class="detail-row">
          <span class="label">Name:</span>
          <span class="value">{{patientInfo.name}}</span>
        </div>
        <div class="detail-row">
          <span class="label">Date of Birth:</span>
          <span class="value">{{patientInfo.dateOfBirth | date:'dd/MM/yyyy'}}</span>
        </div>
        <div class="detail-row">
          <span class="label">Patient Number:</span>
          <span class="value">{{patientInfo.patientNumber}}</span>
        </div>
        <div class="detail-row">
          <span class="label">Exam Number:</span>
          <span class="value">{{patientInfo.examNumber}}</span>
        </div>
        <div class="detail-row">
          <span class="label">Gender:</span>
          <span class="value">{{patientInfo.gender}}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .patient-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .patient-photo {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--border-color);
    }

    .patient-details {
      flex: 1;
    }

    .detail-row {
      display: flex;
      margin-bottom: 8px;
    }

    .detail-row .label {
      font-weight: 600;
      color: var(--text-secondary);
      min-width: 120px;
      margin-right: 10px;
    }

    .detail-row .value {
      color: var(--text-primary);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientInfoBlockComponent {
  @Input() patientInfo$!: Observable<PatientInfo>;
}