import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  examCount: number;
}

interface Exam {
  id: string;
  examNumber: string;
  description: string;
  clinicalIndication: string;
  daysOld: number;
  isReported: boolean;
  site: 'principal' | 'policlinique';
  assignedDoctor?: string;
  isSelected: boolean;
  priority: 'normal' | 'high';
}

interface KPI {
  label: string;
  value: number;
  description: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  kpis: KPI[] = [
    { label: 'Unreported Today', value: 12, description: 'Exams not reported today' },
    { label: 'Unreported This Week', value: 9, description: 'Exams not reported this week' },
    { label: 'Unreported All Time', value: 25, description: 'Total unreported exams' }
  ];

  doctors: Doctor[] = [
    { id: '1', name: 'Damien Suchy', specialty: 'Radiologist', examCount: 8 },
    { id: '2', name: 'Nicolas Dumont', specialty: 'Radiologist', examCount: 12 },
    { id: '3', name: 'Déborah Bernard', specialty: 'Radiologist', examCount: 6 },
    { id: '4', name: 'Daniel Lopez', specialty: 'Radiologist', examCount: 15 },
    { id: '5', name: 'Sylvie Massip', specialty: 'Radiologist', examCount: 9 },
    { id: '6', name: 'Julien Chrisman', specialty: 'Radiologist', examCount: 11 }
  ];

  exams: Exam[] = [
    {
      id: '1',
      examNumber: '25091200872_01',
      description: 'CT - Abdomen - 2025-01-15 09:05',
      clinicalIndication: 'Follow-up scan for previously identified lesion',
      daysOld: 3,
      isReported: false,
      site: 'principal',
      isSelected: false,
      priority: 'normal'
    },
    {
      id: '2',
      examNumber: '25091200456_03',
      description: 'MRI - Brain - 2025-01-12 08:30',
      clinicalIndication: 'Suspected tumor - FEMALE - 67y',
      daysOld: 6,
      isReported: false,
      site: 'policlinique',
      isSelected: false,
      priority: 'high'
    },
    {
      id: '3',
      examNumber: '25091200112_02',
      description: 'X-RAY - Chest - 2025-01-10 07:45',
      clinicalIndication: 'Routine check-up - MALE - 72y',
      daysOld: 8,
      isReported: true,
      site: 'principal',
      assignedDoctor: 'Nicolas Dumont',
      isSelected: false,
      priority: 'normal'
    },
    {
      id: '4',
      examNumber: '25091200234_04',
      description: 'MRI - Spine - 2025-01-08 14:20',
      clinicalIndication: 'Lower back pain, suspected herniated disc',
      daysOld: 10,
      isReported: false,
      site: 'policlinique',
      isSelected: false,
      priority: 'normal'
    },
    {
      id: '5',
      examNumber: '25091200345_05',
      description: 'CT - Thorax - 2025-01-05 11:45',
      clinicalIndication: 'Persistent cough, rule out pulmonary nodules',
      daysOld: 13,
      isReported: true,
      site: 'principal',
      assignedDoctor: 'Damien Suchy',
      isSelected: false,
      priority: 'normal'
    }
  ];

  // Filters
  selectedReportStatus: 'reported' | 'unreported' = 'unreported';
  selectedSite: 'principal' | 'policlinique' | 'all' = 'all';
  selectedDoctor: string | null = null;

  // Modal
  showAssignModal = false;
  selectedDoctorForAssign: string | null = null;

  ngOnInit(): void {
    this.updateCounts();
  }

  get filteredExams(): Exam[] {
    return this.exams.filter(exam => {
      const reportStatusMatch = this.selectedReportStatus === 'reported' ? exam.isReported : !exam.isReported;
      const siteMatch = this.selectedSite === 'all' || exam.site === this.selectedSite;
      const doctorMatch = !this.selectedDoctor || exam.assignedDoctor === this.selectedDoctor;
      
      return reportStatusMatch && siteMatch && doctorMatch;
    });
  }

  get selectedExams(): Exam[] {
    return this.exams.filter(exam => exam.isSelected);
  }

  getReportedCount(): number {
    return this.exams.filter(exam => exam.isReported).length;
  }

  getUnreportedCount(): number {
    return this.exams.filter(exam => !exam.isReported).length;
  }

  getPrincipalSiteCount(): number {
    return this.exams.filter(exam => exam.site === 'principal').length;
  }

  getPolicliniqueSiteCount(): number {
    return this.exams.filter(exam => exam.site === 'policlinique').length;
  }

  getDoctorExamCount(doctorName: string): number {
    return this.exams.filter(exam => exam.assignedDoctor === doctorName).length;
  }

  selectReportStatus(status: 'reported' | 'unreported'): void {
    this.selectedReportStatus = status;
  }

  selectSite(site: 'principal' | 'policlinique' | 'all'): void {
    this.selectedSite = site;
  }

  selectDoctor(doctorName: string | null): void {
    this.selectedDoctor = doctorName;
  }

  toggleExamSelection(exam: Exam): void {
    exam.isSelected = !exam.isSelected;
  }

  selectAllExams(): void {
    const allSelected = this.filteredExams.every(exam => exam.isSelected);
    this.filteredExams.forEach(exam => {
      exam.isSelected = !allSelected;
    });
  }

  setHighPriority(): void {
    this.selectedExams.forEach(exam => {
      exam.priority = 'high';
    });
    console.log('Set high priority for selected exams');
  }

  openAssignModal(): void {
    if (this.selectedExams.length === 0) {
      alert('Please select at least one exam');
      return;
    }
    this.showAssignModal = true;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedDoctorForAssign = null;
  }

  assignToDoctor(): void {
    if (this.selectedDoctorForAssign) {
      this.selectedExams.forEach(exam => {
        exam.assignedDoctor = this.selectedDoctorForAssign!;
      });
      console.log(`Assigned ${this.selectedExams.length} exams to ${this.selectedDoctorForAssign}`);
      this.closeAssignModal();
      this.updateCounts();
    }
  }

  randomizeAssignment(): void {
    this.selectedExams.forEach(exam => {
      const randomDoctor = this.doctors[Math.floor(Math.random() * this.doctors.length)];
      exam.assignedDoctor = randomDoctor.name;
    });
    console.log('Randomized assignment for selected exams');
    this.updateCounts();
  }

  private updateCounts(): void {
    // Update doctor exam counts
    this.doctors.forEach(doctor => {
      doctor.examCount = this.getDoctorExamCount(doctor.name);
    });
  }

  getDaysOldText(daysOld: number): string {
    if (daysOld === 0) return 'Today';
    if (daysOld === 1) return '1 day ago';
    return `${daysOld} days ago`;
  }
}