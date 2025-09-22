import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporting.component.html',
  styleUrl: './reporting.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportingComponent {
  patientData = {
    name: 'Jean Dupont',
    dateOfBirth: 'March 15, 1975',
    address: '123 Rue de la Paix, 75001 Paris, France'
  };

  doctorData = {
    name: 'Dr. Marie Dubois',
    specialty: 'Oncologist',
    hospital: 'Clinique du Parc'
  };

  reportSections = {
    indication: 'Cancer staging, six months after chemotherapy',
    technicalInformation: 'CT scan of the abdomen with IV contrast. Slice thickness: 5mm. Reconstruction: axial, coronal, and sagittal planes.',
    report: 'The CT scan shows marked improvement compared to previous studies. The previously identified lesion in the upper right quadrant has decreased in size by approximately 40%.',
    conclusion: 'Significant improvement following chemotherapy treatment. No new metastatic lesions detected. Continue current treatment protocol.',
    billing: 'CT Abdomen with contrast - Code: 74177'
  };

  // Measurements data
  measurements = [
    {
      date: '2023-03-28',
      label: 'Baseline',
      nodules: [
        { id: 1, name: 'Nodule 1', size: 15.2, change: null, changePercent: null },
        { id: 2, name: 'Nodule 2', size: 12.8, change: null, changePercent: null }
      ]
    },
    {
      date: '2023-05-30',
      label: 'Follow-up',
      nodules: [
        { id: 1, name: 'Nodule 1', size: 14.6, change: -0.6, changePercent: -3.9 },
        { id: 2, name: 'Nodule 2', size: 10.4, change: -2.4, changePercent: -18.8 }
      ]
    },
    {
      date: '2025-01-15',
      label: 'Current',
      nodules: [
        { id: 1, name: 'Nodule 1', size: 14.2, change: -0.4, changePercent: -2.7 },
        { id: 2, name: 'Nodule 2', size: 10.0, change: -0.4, changePercent: -3.8 }
      ]
    }
  ];

  selectedMeasurement = this.measurements[0];

  selectMeasurement(measurement: any): void {
    this.selectedMeasurement = measurement;
  };

  onSecondOpinion(): void {
    console.log('Second Opinion requested');
  }

  onHold(): void {
    console.log('Report put on hold');
  }

  onSign(): void {
    console.log('Report signed');
  }

  onSignAndNext(): void {
    console.log('Report signed and moving to next');
  }

  getChangeClass(change: number | null): string {
    if (change === null) return '';
    return change < 0 ? 'decrease' : change > 0 ? 'increase' : 'stable';
  }

  getEvolutionData(noduleId: number): any[] {
    return this.measurements.map(m => {
      const nodule = m.nodules.find(n => n.id === noduleId);
      return {
        date: m.date,
        size: nodule?.size || 0
      };
    });
  }
}