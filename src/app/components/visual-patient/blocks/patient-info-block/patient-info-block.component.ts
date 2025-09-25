import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { PatientInfo } from '../../../../models/visual-patient.model';

@Component({
  selector: 'app-patient-info-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-info-block.component.html',
  styleUrl: './patient-info-block.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientInfoBlockComponent {
  @Input() patientInfo$!: Observable<PatientInfo>;
}