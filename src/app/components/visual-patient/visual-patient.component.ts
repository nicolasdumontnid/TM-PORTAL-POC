import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { Subscription } from 'rxjs';
import { NavigationService } from '../../services/navigation.service';
import { ExamService } from '../../services/exam.service';
import { VisualPatientService } from '../../services/visual-patient.service';
import { WindowManagerService } from '../../services/window-manager.service';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-visual-patient',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visual-patient.component.html',
  styleUrl: './visual-patient.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisualPatientComponent implements OnInit, OnDestroy {
  @Input() selectedExamId: string | null = null;
  @Output() closeVisualPatient = new EventEmitter<void>();

  private showBurgerMenuSubject = new BehaviorSubject<boolean>(false);
  showBurgerMenu$ = this.showBurgerMenuSubject.asObservable();

  private selectedBlocksSubject = new BehaviorSubject<string[]>(['patient-info', 'calendar-map']);
  selectedBlocks$ = this.selectedBlocksSubject.asObservable();

  private viewModeSubject = new BehaviorSubject<'department' | 'anatomy'>('department');
  viewMode$ = this.viewModeSubject.asObservable();

  private selectedFiltersSubject = new BehaviorSubject<{
    modality: string[];
    department: string[];
    anatomy: string[];
  }>({
    modality: [],
    department: [],
    anatomy: []
  });
  selectedFilters$ = this.selectedFiltersSubject.asObservable();

  private hoveredRegionSubject = new BehaviorSubject<string | null>(null);
  hoveredRegion$ = this.hoveredRegionSubject.asObservable();

  private tooltipDataSubject = new BehaviorSubject<any>(null);
  tooltipData$ = this.tooltipDataSubject.asObservable();

  private tooltipPositionSubject = new BehaviorSubject<{x: number, y: number} | null>(null);
  tooltipPosition$ = this.tooltipPositionSubject.asObservable();

  private subscriptions: Subscription[] = [];

  // Mock data
  availableBlocks = [
    { id: 'patient-info', name: 'Patient Info', icon: '👤' },
    { id: 'calendar-map', name: 'Calendar Map', icon: '📅' },
    { id: 'images', name: 'Images', icon: '🖼️' },
    { id: 'records', name: 'Medical Records', icon: '📋' },
    { id: 'summary', name: 'Summary', icon: '📝' }
  ];

  patientData = {
    name: 'John Doe',
    id: 'P12345',
    age: 45,
    gender: 'Male',
    photo: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    medicalSector: 'Cardiology',
    status: 'Active'
  };

  filterOptions = {
    modality: ['CT', 'MRI', 'X-Ray', 'Ultrasound', 'PET'],
    department: ['Cardiology', 'Neurology', 'Orthopedics', 'Radiology', 'Emergency'],
    anatomy: ['Head', 'Chest', 'Abdomen', 'Pelvis', 'Extremities']
  };

  departments = [
    'Cardiology',
    'Neurology', 
    'Orthopedics',
    'Radiology',
    'Emergency',
    'Oncology',
    'Gastroenterology',
    'Pulmonology'
  ];

  anatomicalRegions = [
    'Head/Neck',
    'Chest',
    'Abdomen',
    'Pelvis',
    'Upper Extremities',
    'Lower Extremities'
  ];

  examPoints = [
    {
      id: 'exam1',
      date: new Date('2024-01-15'),
      department: 'Cardiology',
      anatomy: 'Chest',
      modality: 'CT',
      name: 'Cardiac CT',
      description: 'Routine cardiac examination',
      images: [
        'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
        'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop'
      ]
    },
    {
      id: 'exam2',
      date: new Date('2024-02-20'),
      department: 'Neurology',
      anatomy: 'Head',
      modality: 'MRI',
      name: 'Brain MRI',
      description: 'Follow-up brain scan',
      images: [
        'https://images.pexels.com/photos/4386468/pexels-photo-4386468.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop'
      ]
    },
    {
      id: 'exam3',
      date: new Date('2024-03-10'),
      department: 'Orthopedics',
      anatomy: 'Lower Extremities',
      modality: 'X-Ray',
      name: 'Knee X-Ray',
      description: 'Knee pain evaluation',
      images: []
    },
    {
      id: 'exam4',
      date: new Date('2024-04-05'),
      department: 'Radiology',
      anatomy: 'Abdomen',
      modality: 'Ultrasound',
      name: 'Abdominal US',
      description: 'Abdominal ultrasound',
      images: [
        'https://images.pexels.com/photos/4386469/pexels-photo-4386469.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
        'https://images.pexels.com/photos/4386470/pexels-photo-4386470.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
        'https://images.pexels.com/photos/4386471/pexels-photo-4386471.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop'
      ]
    },
    {
      id: 'exam5',
      date: new Date('2024-05-15'),
      department: 'Emergency',
      anatomy: 'Chest',
      modality: 'CT',
      name: 'Emergency CT',
      description: 'Emergency chest CT',
      images: []
    },
    {
      id: 'exam6',
      date: new Date('2024-06-20'),
      department: 'Cardiology',
      anatomy: 'Chest',
      modality: 'PET',
      name: 'Cardiac PET',
      description: 'Cardiac PET scan',
      images: [
        'https://images.pexels.com/photos/4386472/pexels-photo-4386472.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop'
      ]
    }
  ];

  medicalRecords = [
    {
      date: new Date('2024-01-10'),
      name: 'Dr. Smith',
      description: 'Initial consultation for chest pain. Patient reports intermittent chest discomfort over the past month.'
    },
    {
      date: new Date('2024-01-20'),
      name: 'Dr. Johnson',
      description: 'Follow-up after cardiac CT. Results show normal coronary arteries with no significant stenosis.'
    },
    {
      date: new Date('2024-02-15'),
      name: 'Dr. Williams',
      description: 'Neurological consultation for headaches. Recommended brain MRI to rule out structural abnormalities.'
    },
    {
      date: new Date('2024-03-05'),
      name: 'Dr. Brown',
      description: 'Orthopedic evaluation for knee pain. Physical examination reveals mild joint effusion.'
    }
  ];

  imagesByDate = [
    {
      date: '2024-01-15',
      images: [
        {
          filename: 'cardiac_ct_001.dcm',
          url: 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop'
        },
        {
          filename: 'cardiac_ct_002.dcm',
          url: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop'
        },
        {
          filename: 'cardiac_ct_003.dcm',
          url: 'https://images.pexels.com/photos/4386468/pexels-photo-4386468.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop'
        }
      ]
    },
    {
      date: '2024-02-20',
      images: [
        {
          filename: 'brain_mri_001.dcm',
          url: 'https://images.pexels.com/photos/4386469/pexels-photo-4386469.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop'
        },
        {
          filename: 'brain_mri_002.dcm',
          url: 'https://images.pexels.com/photos/4386470/pexels-photo-4386470.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop'
        }
      ]
    },
    {
      date: '2024-04-05',
      images: [
        {
          filename: 'abdominal_us_001.dcm',
          url: 'https://images.pexels.com/photos/4386471/pexels-photo-4386471.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop'
        },
        {
          filename: 'abdominal_us_002.dcm',
          url: 'https://images.pexels.com/photos/4386472/pexels-photo-4386472.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop'
        },
        {
          filename: 'abdominal_us_003.dcm',
          url: 'https://images.pexels.com/photos/4386473/pexels-photo-4386473.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop'
        },
        {
          filename: 'abdominal_us_004.dcm',
          url: 'https://images.pexels.com/photos/4386474/pexels-photo-4386474.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop'
        }
      ]
    }
  ];

  constructor(
    private navigationService: NavigationService,
    private examService: ExamService,
    private visualPatientService: VisualPatientService,
    private windowManagerService: WindowManagerService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    // Initialize component
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onClose(): void {
    this.closeVisualPatient.emit();
  }

  toggleBurgerMenu(): void {
    this.showBurgerMenuSubject.next(!this.showBurgerMenuSubject.value);
  }

  addBlock(blockId: string): void {
    const currentBlocks = this.selectedBlocksSubject.value;
    if (!currentBlocks.includes(blockId)) {
      this.selectedBlocksSubject.next([...currentBlocks, blockId]);
    }
    this.showBurgerMenuSubject.next(false);
  }

  removeBlock(blockId: string): void {
    const currentBlocks = this.selectedBlocksSubject.value;
    this.selectedBlocksSubject.next(currentBlocks.filter(id => id !== blockId));
  }

  isBlockSelected(blockId: string): boolean {
    return this.selectedBlocksSubject.value.includes(blockId);
  }

  getBlockName(blockId: string): string {
    const block = this.availableBlocks.find(b => b.id === blockId);
    return block ? block.name : blockId;
  }

  setViewMode(mode: 'department' | 'anatomy'): void {
    this.viewModeSubject.next(mode);
  }

  toggleFilter(category: 'modality' | 'department' | 'anatomy', value: string): void {
    const currentFilters = this.selectedFiltersSubject.value;
    const categoryFilters = currentFilters[category];
    
    if (categoryFilters.includes(value)) {
      currentFilters[category] = categoryFilters.filter(f => f !== value);
    } else {
      currentFilters[category] = [...categoryFilters, value];
    }
    
    this.selectedFiltersSubject.next({ ...currentFilters });
  }

  isFilterActive(category: 'modality' | 'department' | 'anatomy', value: string): boolean {
    return this.selectedFiltersSubject.value[category].includes(value);
  }

  getFilteredExamPoints(): any[] {
    const filters = this.selectedFiltersSubject.value;
    
    return this.examPoints.filter(exam => {
      const modalityMatch = filters.modality.length === 0 || filters.modality.includes(exam.modality);
      const departmentMatch = filters.department.length === 0 || filters.department.includes(exam.department);
      const anatomyMatch = filters.anatomy.length === 0 || filters.anatomy.includes(exam.anatomy);
      
      return modalityMatch && departmentMatch && anatomyMatch;
    });
  }

  getExamPosition(exam: any): { x: number, y: number } {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const examDays = (exam.date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    const x = (examDays / totalDays) * 100;
    
    let y = 0;
    const viewMode = this.viewModeSubject.value;
    
    if (viewMode === 'department') {
      const departmentIndex = this.departments.indexOf(exam.department);
      y = (departmentIndex / this.departments.length) * 100;
    } else {
      const anatomyIndex = this.anatomicalRegions.indexOf(exam.anatomy);
      y = (anatomyIndex / this.anatomicalRegions.length) * 100;
    }
    
    return { x, y };
  }

  getRegionHeight(): number {
    const viewMode = this.viewModeSubject.value;
    const totalRegions = viewMode === 'department' ? this.departments.length : this.anatomicalRegions.length;
    return 100 / totalRegions;
  }

  getRegionTop(index: number): number {
    return index * this.getRegionHeight();
  }

  onRegionHover(region: string): void {
    this.hoveredRegionSubject.next(region);
  }

  onRegionLeave(): void {
    this.hoveredRegionSubject.next(null);
  }

  isRegionHovered(region: string): boolean {
    return this.hoveredRegionSubject.value === region;
  }

  onExamPointHover(event: MouseEvent, exam: any): void {
    this.tooltipDataSubject.next(exam);
    this.tooltipPositionSubject.next({ x: event.clientX, y: event.clientY });
  }

  onExamPointLeave(): void {
    this.tooltipDataSubject.next(null);
    this.tooltipPositionSubject.next(null);
  }

  getTodayPosition(): number {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');
    const today = new Date();
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const todayDays = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return (todayDays / totalDays) * 100;
  }

  generateTimeLabels(): { position: number, label: string }[] {
    const labels = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 12; i++) {
      const position = (i / 11) * 100;
      labels.push({ position, label: months[i] });
    }
    
    return labels;
  }

  openReporting(examPoint: any): void {
    const reportingData$ = this.visualPatientService.getReportingData(examPoint.id);
    const imagesConfig$ = this.configService.getImagesConfig();
    const reportingTemplate$ = this.configService.getReportingTemplate();

    combineLatest([reportingData$, imagesConfig$, reportingTemplate$]).subscribe(
      ([reportingData, imagesConfig, template]) => {
        const patientName = `${this.patientData.name}`;
        const patientId = examPoint?.id || 'Unknown';
        const examDate = examPoint ? examPoint.date.toLocaleDateString() : new Date().toLocaleDateString();
        
        const populatedHtml = template.replace(/{{patientName}}/g, patientName)
                                    .replace(/{{patientId}}/g, patientId)
                                    .replace(/{{examDate}}/g, examDate);
        
        if (this.windowManagerService.reportingWindow && !this.windowManagerService.reportingWindow.closed) {
          this.windowManagerService.reportingWindow.document.body.innerHTML = populatedHtml;
          this.windowManagerService.reportingWindow.focus();
        }
      }
    );
  }
}