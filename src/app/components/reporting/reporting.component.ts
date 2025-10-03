import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../services/exam.service';
import { Subscription } from 'rxjs';

interface Nodule {
  id: number;
  name: string;
  size: number;
  change: number | null;
  changePercent: number | null;
}

interface Measurement {
  date: string;
  label: string;
  nodules: Nodule[];
}

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporting.component.html',
  styleUrl: './reporting.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportingComponent implements OnInit, OnDestroy {
  private subscription: Subscription | null = null;

  constructor(
    private examService: ExamService,
    private cdr: ChangeDetectorRef
  ) {}
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
    findings: ''
  };

  selectedTemplate = '';

  // Measurements data
  measurements: Measurement[] = [
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

  selectedMeasurement: Measurement = this.measurements[0];

  selectMeasurement(measurement: Measurement): void {
    this.selectedMeasurement = measurement;
  };

  onTemplateChange(): void {
    if (this.selectedTemplate === 'CT Chest negative') {
      this.reportSections = {
        indication: 'Routine chest CT scan for annual screening',
        technicalInformation: 'CT scan of the chest without contrast. Slice thickness: 1.25mm. Reconstruction: axial, coronal, and sagittal planes. Inspiration breath-hold technique.',
        report: 'The chest CT demonstrates normal lung parenchyma bilaterally. No pulmonary nodules, masses, or consolidations are identified. The mediastinal structures appear normal with no lymphadenopathy. Heart size is within normal limits. No pleural effusion or pneumothorax.',
        conclusion: 'Normal chest CT examination. No evidence of pulmonary pathology. Recommend routine follow-up as clinically indicated.',
        billing: 'CT Chest without contrast - Code: 71250',
        findings: 'No abnormal findings detected'
      };
    } else if (this.selectedTemplate === 'CT Chest positive') {
      this.reportSections = {
        indication: 'Evaluation of persistent cough and chest pain',
        technicalInformation: 'CT scan of the chest with IV contrast. Slice thickness: 1.25mm. Reconstruction: axial, coronal, and sagittal planes. Post-contrast images obtained.',
        report: 'The chest CT reveals a 2.3 cm spiculated nodule in the right upper lobe with associated pleural retraction. Multiple smaller nodules are noted in both lungs, the largest measuring 8mm in the left lower lobe. Mediastinal lymphadenopathy is present with enlarged paratracheal and subcarinal nodes.',
        conclusion: 'Findings highly suspicious for primary lung malignancy with metastatic disease. Recommend urgent oncology consultation and tissue sampling for definitive diagnosis.',
        billing: 'CT Chest with contrast - Code: 71260',
        findings: 'Multiple pulmonary nodules with suspicious characteristics'
      };
    }
  }

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

  getEvolutionData(noduleId: number): { date: string; size: number }[] {
    return this.measurements.map(m => {
      const nodule = m.nodules.find(n => n.id === noduleId);
      return {
        date: m.date,
        size: nodule?.size || 0
      };
    });
  }

  ngOnInit(): void {
    this.subscription = this.examService.getSelectedExam().subscribe(exam => {
      if (exam) {
        this.updateReportingData(exam);
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateReportingData(exam: any): void {
    this.patientData = {
      name: exam.patientName,
      dateOfBirth: this.calculateDateOfBirth(exam.indication),
      address: '123 Rue de la Paix, 75001 Paris, France'
    };

    this.doctorData = {
      name: exam.assignedDoctor || 'Unassigned',
      specialty: this.getSpecialtyFromExamType(exam.examType),
      hospital: 'Clinique du Parc'
    };

    this.reportSections = {
      indication: exam.indication,
      technicalInformation: this.generateTechnicalInfo(exam.examType),
      report: 'Report pending analysis...',
      conclusion: 'Pending review.',
      billing: this.generateBillingCode(exam.examType),
      findings: ''
    };
  }

  private calculateDateOfBirth(indication: string): string {
    const ageMatch = indication.match(/(\d+)y/);
    if (ageMatch) {
      const age = parseInt(ageMatch[1], 10);
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - age;
      return `January 1, ${birthYear}`;
    }
    return 'Unknown';
  }

  private getSpecialtyFromExamType(examType: string): string {
    if (examType.includes('Brain') || examType.includes('Head')) return 'Neurologist';
    if (examType.includes('Chest') || examType.includes('Thorax') || examType.includes('Lung')) return 'Pulmonologist';
    if (examType.includes('Abdomen') || examType.includes('Pelvis')) return 'Gastroenterologist';
    if (examType.includes('Cardiac') || examType.includes('Heart')) return 'Cardiologist';
    if (examType.includes('Mammography')) return 'Oncologist';
    if (examType.includes('Knee') || examType.includes('Shoulder') || examType.includes('Hip') || examType.includes('Spine')) return 'Orthopedist';
    return 'Radiologist';
  }

  private generateTechnicalInfo(examType: string): string {
    if (examType.includes('CT')) {
      return 'CT scan with IV contrast. Slice thickness: 5mm. Reconstruction: axial, coronal, and sagittal planes.';
    } else if (examType.includes('MRI')) {
      return 'MRI examination. Sequences: T1, T2, FLAIR. Slice thickness: 3mm.';
    } else if (examType.includes('X-RAY')) {
      return 'Digital radiography. Standard AP and lateral views.';
    } else if (examType.includes('Ultrasound')) {
      return 'Ultrasound examination with Doppler imaging where applicable.';
    } else if (examType.includes('Mammography')) {
      return 'Digital mammography. CC and MLO views bilaterally.';
    }
    return 'Standard imaging protocol applied.';
  }

  private generateBillingCode(examType: string): string {
    if (examType.includes('CT') && examType.includes('Abdomen')) return 'CT Abdomen with contrast - Code: 74177';
    if (examType.includes('CT') && examType.includes('Chest')) return 'CT Chest with contrast - Code: 71260';
    if (examType.includes('CT') && examType.includes('Head')) return 'CT Head without contrast - Code: 70450';
    if (examType.includes('MRI') && examType.includes('Brain')) return 'MRI Brain with contrast - Code: 70553';
    if (examType.includes('MRI') && examType.includes('Spine')) return 'MRI Spine - Code: 72148';
    if (examType.includes('X-RAY')) return 'X-RAY - Code: 71010';
    if (examType.includes('Ultrasound')) return 'Ultrasound - Code: 76700';
    if (examType.includes('Mammography')) return 'Mammography - Code: 77067';
    return 'Standard imaging - Code: 00000';
  }
}