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
    billing: 'CT Abdomen with contrast - Code: 74177',
    findings: 'Liver, spleen, and kidneys appear normal. Lymph nodes are within normal limits. No suspicious lesions identified.'
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
}