import { Component, ChangeDetectionStrategy, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../services/navigation.service';
import { ExamService } from '../../services/exam.service';

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
  priority: 'normal' | 'high' | 'minor';
  modality: 'CT' | 'MR' | 'US' | 'CR';
  examDate: Date;
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
  @Output() close = new EventEmitter<void>();

  constructor(
    private navigationService: NavigationService,
    private examService: ExamService
  ) {}

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
      isReported: true,
      site: 'principal',
      assignedDoctor: 'Damien Suchy',
      isSelected: false,
      priority: 'high',
      modality: 'CT',
      examDate: new Date('2025-01-15')
    },
    {
      id: '2',
      examNumber: '25091200456_03',
      description: 'MRI - Brain - 2025-01-12 08:30',
      clinicalIndication: 'Suspected tumor - FEMALE - 67y',
      daysOld: 6,
      isReported: false,
      site: 'policlinique',
      assignedDoctor: 'Nicolas Dumont',
      isSelected: false,
      priority: 'high',
      modality: 'MR',
      examDate: new Date('2025-01-12')
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
      priority: 'minor',
      modality: 'CR',
      examDate: new Date('2025-01-10')
    },
    {
      id: '4',
      examNumber: '25091200234_04',
      description: 'MRI - Spine - 2025-01-08 14:20',
      clinicalIndication: 'Lower back pain, suspected herniated disc',
      daysOld: 10,
      isReported: true,
      site: 'policlinique',
      assignedDoctor: 'Déborah Bernard',
      isSelected: false,
      priority: 'minor',
      modality: 'MR',
      examDate: new Date('2025-01-08')
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
      priority: 'minor',
      modality: 'CT',
      examDate: new Date('2025-01-05')
    },
    // 2024 Exams
    {
      id: '6',
      examNumber: '24121500123_01',
      description: 'CT - Head - 2024-12-15 10:30',
      clinicalIndication: 'Post-accident evaluation - MALE - 45y',
      daysOld: 34,
      isReported: true,
      site: 'principal',
      assignedDoctor: 'Déborah Bernard',
      isSelected: false,
      priority: 'high',
      modality: 'CT',
      examDate: new Date('2024-12-15')
    },
    {
      id: '7',
      examNumber: '24111000456_02',
      description: 'US - Abdomen - 2024-11-10 14:15',
      clinicalIndication: 'Abdominal pain investigation - FEMALE - 38y',
      daysOld: 69,
      isReported: true,
      site: 'policlinique',
      assignedDoctor: 'Daniel Lopez',
      isSelected: false,
      priority: 'minor',
      modality: 'US',
      examDate: new Date('2024-11-10')
    },
    {
      id: '8',
      examNumber: '24090500789_03',
      description: 'MRI - Knee - 2024-09-05 16:45',
      clinicalIndication: 'Sports injury assessment - MALE - 28y',
      daysOld: 135,
      isReported: true,
      site: 'principal',
      assignedDoctor: 'Daniel Lopez',
      isSelected: false,
      priority: 'minor',
      modality: 'MR',
      examDate: new Date('2024-09-05')
    },
    {
      id: '9',
      examNumber: '24070200321_04',
      description: 'CT - Pelvis - 2024-07-02 09:20',
      clinicalIndication: 'Oncology follow-up - FEMALE - 62y',
      daysOld: 200,
      isReported: true,
      site: 'policlinique',
      assignedDoctor: 'Sylvie Massip',
      isSelected: false,
      priority: 'high',
      modality: 'CT',
      examDate: new Date('2024-07-02')
    },
    {
      id: '10',
      examNumber: '24040800654_05',
      description: 'CR - Shoulder - 2024-04-08 11:30',
      clinicalIndication: 'Shoulder dislocation - MALE - 35y',
      daysOld: 285,
      isReported: true,
      site: 'principal',
      assignedDoctor: 'Sylvie Massip',
      isSelected: false,
      priority: 'normal',
      modality: 'CR',
      examDate: new Date('2024-04-08')
    },
    // 2023 Exams
    {
      id: '11',
      examNumber: '23120100987_01',
      description: 'MRI - Brain - 2023-12-01 13:45',
      clinicalIndication: 'Headache investigation - FEMALE - 55y',
      daysOld: 413,
      isReported: false,
      site: 'policlinique',
      assignedDoctor: 'Julien Chrisman',
      isSelected: false,
      priority: 'normal',
      modality: 'MR',
      examDate: new Date('2023-12-01')
    },
    {
      id: '12',
      examNumber: '23081500234_02',
      description: 'CT - Chest - 2023-08-15 08:15',
      clinicalIndication: 'Lung cancer screening - MALE - 68y',
      daysOld: 521,
      isReported: false,
      site: 'principal',
      assignedDoctor: 'Damien Suchy',
      isSelected: false,
      priority: 'high',
      modality: 'CT',
      examDate: new Date('2023-08-15')
    },
    {
      id: '13',
      examNumber: '23050300567_03',
      description: 'US - Thyroid - 2023-05-03 15:30',
      clinicalIndication: 'Thyroid nodule evaluation - FEMALE - 42y',
      daysOld: 625,
      isReported: false,
      site: 'policlinique',
      assignedDoctor: 'Nicolas Dumont',
      isSelected: false,
      priority: 'normal',
      modality: 'US',
      examDate: new Date('2023-05-03')
    },
    {
      id: '14',
      examNumber: '23021200890_04',
      description: 'MRI - Spine - 2023-02-12 12:00',
      clinicalIndication: 'Chronic back pain - MALE - 51y',
      daysOld: 705,
      isReported: false,
      site: 'principal',
      assignedDoctor: 'Déborah Bernard',
      isSelected: false,
      priority: 'normal',
      modality: 'MR',
      examDate: new Date('2023-02-12')
    },
    // 2022 Exams
    {
      id: '15',
      examNumber: '22110800123_01',
      description: 'CT - Abdomen - 2022-11-08 10:45',
      clinicalIndication: 'Digestive system evaluation - FEMALE - 59y',
      daysOld: 801,
      isReported: true,
      site: 'policlinique',
      assignedDoctor: 'Damien Suchy',
      isSelected: false,
      priority: 'normal',
      modality: 'CT',
      examDate: new Date('2022-11-08')
    },
    {
      id: '16',
      examNumber: '22072000456_02',
      description: 'CR - Hip - 2022-07-20 14:20',
      clinicalIndication: 'Hip fracture assessment - MALE - 78y',
      daysOld: 912,
      isReported: false,
      site: 'principal',
      assignedDoctor: 'Déborah Bernard',
      isSelected: false,
      priority: 'high',
      modality: 'CR',
      examDate: new Date('2022-07-20')
    },
    {
      id: '17',
      examNumber: '22040500789_03',
      description: 'US - Cardiac - 2022-04-05 09:30',
      clinicalIndication: 'Cardiac function assessment - FEMALE - 71y',
      daysOld: 1018,
      isReported: false,
      site: 'policlinique',
      assignedDoctor: 'Daniel Lopez',
      isSelected: false,
      priority: 'normal',
      modality: 'US',
      examDate: new Date('2022-04-05')
    },
    {
      id: '18',
      examNumber: '22011200321_04',
      description: 'MRI - Shoulder - 2022-01-12 16:15',
      clinicalIndication: 'Rotator cuff injury - MALE - 44y',
      daysOld: 1101,
      isReported: false,
      site: 'principal',
      assignedDoctor: 'Daniel Lopez',
      isSelected: false,
      priority: 'normal',
      modality: 'MR',
      examDate: new Date('2022-01-12')
    },
    // 2021 Exams
    {
      id: '19',
      examNumber: '21100300654_01',
      description: 'CT - Thorax - 2021-10-03 11:00',
      clinicalIndication: 'COVID-19 complications - FEMALE - 48y',
      daysOld: 1201,
      isReported: true,
      site: 'policlinique',
      assignedDoctor: 'Sylvie Massip',
      isSelected: false,
      priority: 'high',
      modality: 'CT',
      examDate: new Date('2021-10-03')
    },
    {
      id: '20',
      examNumber: '21061500987_02',
      description: 'US - Liver - 2021-06-15 13:45',
      clinicalIndication: 'Hepatic function evaluation - MALE - 56y',
      daysOld: 1311,
      isReported: false,
      site: 'principal',
      assignedDoctor: 'Julien Chrisman',
      isSelected: false,
      priority: 'normal',
      modality: 'US',
      examDate: new Date('2021-06-15')
    },
    {
      id: '21',
      examNumber: '21030800234_03',
      description: 'MRI - Brain - 2021-03-08 08:30',
      clinicalIndication: 'Stroke evaluation - FEMALE - 73y',
      daysOld: 1410,
      isReported: false,
      site: 'policlinique',
      assignedDoctor: 'Julien Chrisman',
      isSelected: false,
      priority: 'high',
      modality: 'MR',
      examDate: new Date('2021-03-08')
    },
    // 2020 Exams
    {
      id: '22',
      examNumber: '20121000567_01',
      description: 'CT - Head - 2020-12-10 15:20',
      clinicalIndication: 'Trauma assessment - MALE - 32y',
      daysOld: 1498,
      isReported: true,
      site: 'principal',
      assignedDoctor: 'Nicolas Dumont',
      isSelected: false,
      priority: 'high',
      modality: 'CT',
      examDate: new Date('2020-12-10')
    },
    {
      id: '23',
      examNumber: '20082200890_02',
      description: 'CR - Chest - 2020-08-22 10:15',
      clinicalIndication: 'Pneumonia follow-up - FEMALE - 65y',
      daysOld: 1608,
      isReported: false,
      site: 'policlinique',
      assignedDoctor: 'Sylvie Massip',
      isSelected: false,
      priority: 'normal',
      modality: 'CR',
      examDate: new Date('2020-08-22')
    },
    {
      id: '24',
      examNumber: '20050500123_03',
      description: 'US - Kidney - 2020-05-05 12:45',
      clinicalIndication: 'Renal function assessment - MALE - 61y',
      daysOld: 1717,
      isReported: false,
      site: 'principal',
      assignedDoctor: 'Damien Suchy',
      isSelected: false,
      priority: 'normal',
      modality: 'US',
      examDate: new Date('2020-05-05')
    },
    {
      id: '25',
      examNumber: '20021800456_04',
      description: 'MRI - Pelvis - 2020-02-18 14:30',
      clinicalIndication: 'Gynecological evaluation - FEMALE - 39y',
      daysOld: 1794,
      isReported: true,
      site: 'policlinique',
      assignedDoctor: 'Déborah Bernard',
      isSelected: false,
      priority: 'normal',
      modality: 'MR',
      examDate: new Date('2020-02-18')
    }
  ];

  // Filters
  selectedReportStatus: 'reported' | 'unreported' = 'unreported';
  selectedPriority: 'high' | 'normal' | 'minor' | 'all' = 'all';
  selectedSite: 'principal' | 'policlinique' | 'all' = 'all';
  selectedDoctor: string | null = null;
  selectedModality: 'CT' | 'MR' | 'US' | 'CR' | 'all' = 'all';
  
  // Date filter
  startDate: string = '';
  endDate: string = '';
  todayDate: string = '';
  
  // Slider values (days since epoch)
  public minSliderValue: number = 0;
  public maxSliderValue: number = 0;
  public startSliderValue: number = 0;
  public endSliderValue: number = 0;

  // Modal
  showAssignModal = false;
  selectedDoctorForAssign: string | null = null;
  
  // Tooltip and highlighting states
  showStartTooltip = false;
  showEndTooltip = false;
  highlightStartInput = false;
  highlightEndInput = false;

  ngOnInit(): void {
    this.updateCounts();
    this.initializeDates();
  }

  private initializeDates(): void {
    const today = new Date();
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(today.getFullYear() - 3);
    
    this.todayDate = this.formatDateForInput(today);
    this.endDate = this.formatDateForInput(today);
    this.startDate = this.formatDateForInput(threeYearsAgo);
    
    // Initialize slider values
    this.initializeSliderValues();
  }
  
  private initializeSliderValues(): void {
    const today = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(today.getFullYear() - 5);
    
    // Set slider range (5 years ago to today)
    this.minSliderValue = Math.floor(fiveYearsAgo.getTime() / (1000 * 60 * 60 * 24));
    this.maxSliderValue = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    
    // Set current values
    const startDateObj = new Date(this.startDate);
    const endDateObj = new Date(this.endDate);
    
    this.startSliderValue = Math.floor(startDateObj.getTime() / (1000 * 60 * 60 * 24));
    this.endSliderValue = Math.floor(endDateObj.getTime() / (1000 * 60 * 60 * 24));
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  get filteredExams(): Exam[] {
    return this.exams.filter(exam => {
      const reportStatusMatch = this.selectedReportStatus === 'reported' ? exam.isReported : !exam.isReported;
      const siteMatch = this.selectedSite === 'all' || exam.site === this.selectedSite;
      const doctorMatch = !this.selectedDoctor || exam.assignedDoctor === this.selectedDoctor;
      const modalityMatch = this.selectedModality === 'all' || exam.modality === this.selectedModality;
      
      // Time range filter
      const startDateObj = new Date(this.startDate);
      const endDateObj = new Date(this.endDate);
      endDateObj.setHours(23, 59, 59, 999); // Include the entire end date
      const timeMatch = exam.examDate >= startDateObj && exam.examDate <= endDateObj;
      
      return reportStatusMatch && siteMatch && doctorMatch && modalityMatch && timeMatch;
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

  selectModality(modality: 'CT' | 'MR' | 'US' | 'CR' | 'all'): void {
    this.selectedModality = modality;
  }

  getModalityCount(modality: 'CT' | 'MR' | 'US' | 'CR'): number {
    return this.exams.filter(exam => exam.modality === modality).length;
  }

  getPriorityCount(priority: 'high' | 'normal' | 'minor'): number {
    return this.exams.filter(exam => exam.priority === priority).length;
  }

  updateStartDate(event: any): void {
    this.startDate = event.target.value;
  }

  updateEndDate(event: any): void {
    this.endDate = event.target.value;
    this.updateSliderFromDate('end');
  }
  
  onStartSliderChange(event: any): void {
    const newValue = parseInt(event.target.value);
    
    // Ensure start is not after end
    if (newValue <= this.endSliderValue) {
      this.startSliderValue = newValue;
      this.updateDateFromSlider('start');
    } else {
      // Reset slider to previous valid value
      event.target.value = this.startSliderValue;
    }
  }
  
  onEndSliderChange(event: any): void {
    const newValue = parseInt(event.target.value);
    
    // Ensure end is not before start
    if (newValue >= this.startSliderValue) {
      this.endSliderValue = newValue;
      this.updateDateFromSlider('end');
    } else {
      // Reset slider to previous valid value
      event.target.value = this.endSliderValue;
    }
  }
  
  private updateDateFromSlider(type: 'start' | 'end'): void {
    if (type === 'start') {
      const date = new Date(this.startSliderValue * 24 * 60 * 60 * 1000);
      this.startDate = this.formatDateForInput(date);
    } else {
      const date = new Date(this.endSliderValue * 24 * 60 * 60 * 1000);
      this.endDate = this.formatDateForInput(date);
    }
  }
  
  private updateSliderFromDate(type: 'start' | 'end'): void {
    if (type === 'start') {
      const date = new Date(this.startDate);
      this.startSliderValue = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
    } else {
      const date = new Date(this.endDate);
      this.endSliderValue = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
    }
  }
  
  getSliderRangeLeft(): number {
    const range = this.maxSliderValue - this.minSliderValue;
    return ((this.startSliderValue - this.minSliderValue) / range) * 100;
  }
  
  getSliderRangeWidth(): number {
    const range = this.maxSliderValue - this.minSliderValue;
    const startPercent = ((this.startSliderValue - this.minSliderValue) / range) * 100;
    const endPercent = ((this.endSliderValue - this.minSliderValue) / range) * 100;
    return endPercent - startPercent;
  }
  
  getSliderTooltipDate(type: 'start' | 'end'): string {
    const sliderValue = type === 'start' ? this.startSliderValue : this.endSliderValue;
    const date = new Date(sliderValue * 24 * 60 * 60 * 1000);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
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

  onClose() {
    console.log('Dashboard close button clicked');
    this.close.emit();
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

  get selectAllButtonText(): string {
    return this.areAllFilteredExamsSelected ? 'Deselect All' : 'Select All';
  }

  get areAllFilteredExamsSelected(): boolean {
    if (this.filteredExams.length === 0) {
      return false;
    }
    
    for (const exam of this.filteredExams) {
      if (!exam.isSelected) {
        return false;
      }
    }
    return true;
  }


}