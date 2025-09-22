import { Component, ChangeDetectionStrategy, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest, map } from 'rxjs';
import { VisualPatientService } from '../../services/visual-patient.service';
import { PatientInfo, RadiologicalRequest, AISummary, RadioReport, PatientRecord, ExamPoint, ImagesByDate, VisualPatientBlock, GraphicFilter, Department, AnatomyRegion } from '../../models/visual-patient.model';

@Component({
  selector: 'app-visual-patient',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visual-patient.component.html',
  styleUrl: './visual-patient.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisualPatientComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  patientInfo$!: Observable<PatientInfo>;
  radiologicalRequest$!: Observable<RadiologicalRequest>;
  aiSummary$!: Observable<AISummary>;
  radioReport$!: Observable<RadioReport>;
  patientRecords$!: Observable<PatientRecord[]>;
  examPoints$!: Observable<ExamPoint[]>;
  imagesByDate$!: Observable<ImagesByDate[]>;

  private visibleBlocksSubject = new BehaviorSubject<VisualPatientBlock[]>([]);
  visibleBlocks$ = this.visibleBlocksSubject.asObservable();

  // Patient Records filtering
  private recordsFilterSubject = new BehaviorSubject<string>('All');
  recordsFilter$ = this.recordsFilterSubject.asObservable();
  filteredPatientRecords$!: Observable<PatientRecord[]>;

  // Graphic Filter
  private graphicFilterSubject = new BehaviorSubject<GraphicFilter>({
    view: 'department',
    department: 'ALL',
    anatomy: 'ALL',
    timeline: 'ALL'
  });
  graphicFilter$ = this.graphicFilterSubject.asObservable();
  filteredExamPoints$!: Observable<ExamPoint[]>;
  departments$!: Observable<Department[]>;
  anatomyRegions$!: Observable<AnatomyRegion[]>;

  showBurgerMenu = false;
  hoveredRegion: string | null = null;
  hoveredExamPoint: ExamPoint | null = null;
  tooltipPosition = { x: 0, y: 0 };

  anatomicalRegions = [
    'Head',
    'Shoulder', 
    'Upper Limb',
    'Pelvis',
    'Lower Limb'
  ];

  constructor(private visualPatientService: VisualPatientService) {}

  ngOnInit(): void {
    this.loadData();
    this.loadDefaultBlocks();
    this.setupFiltering();
  }

  private loadData(): void {
    this.patientInfo$ = this.visualPatientService.getPatientInfo();
    this.radiologicalRequest$ = this.visualPatientService.getRadiologicalRequest();
    this.aiSummary$ = this.visualPatientService.getAISummary();
    this.radioReport$ = this.visualPatientService.getRadioReport();
    this.patientRecords$ = this.visualPatientService.getPatientRecords();
    this.examPoints$ = this.visualPatientService.getExamPoints();
    this.imagesByDate$ = this.visualPatientService.getImagesByDate();
    this.departments$ = this.visualPatientService.getDepartments();
    this.anatomyRegions$ = this.visualPatientService.getAnatomyRegions();
  }

  private loadDefaultBlocks(): void {
    this.visualPatientService.getDefaultBlocks().subscribe(blocks => {
      this.visibleBlocksSubject.next(blocks);
    });
  }

  private setupFiltering(): void {
    // Filter patient records
    this.filteredPatientRecords$ = combineLatest([
      this.patientRecords$,
      this.recordsFilter$
    ]).pipe(
      map(([records, filter]) => {
        if (filter === 'All') return records;
        return records.filter(record => {
          switch (filter) {
            case 'Imaging':
              return ['CT', 'MRI', 'X-Ray', 'Ultrasound', 'Mammography', 'PET'].some(type => 
                record.examName.includes(type));
            case 'Lab':
              return record.examName.includes('Lab') || record.examName.includes('Blood');
            case 'Reports':
              return record.examName.includes('Report') || record.examName.includes('Biopsy');
            default:
              return true;
          }
        });
      })
    );

    // Filter exam points for graphic
    this.filteredExamPoints$ = combineLatest([
      this.examPoints$,
      this.graphicFilter$
    ]).pipe(
      map(([examPoints, filter]) => {
        let filtered = [...examPoints];

        // Filter by department
        if (filter.view === 'department' && filter.department !== 'ALL') {
          filtered = filtered.filter(exam => exam.department === filter.department);
        }

        // Filter by anatomy
        if (filter.view === 'anatomy' && filter.anatomy !== 'ALL') {
          if (filter.anatomy === 'Others') {
            const knownRegions = this.anatomicalRegions;
            filtered = filtered.filter(exam => !knownRegions.includes(exam.anatomicalRegion));
          } else {
            filtered = filtered.filter(exam => exam.anatomicalRegion === filter.anatomy);
          }
        }

        // Filter by timeline
        if (filter.timeline !== 'ALL') {
          const now = new Date();
          const cutoffDate = new Date();
          
          switch (filter.timeline) {
            case '1 Week':
              cutoffDate.setDate(now.getDate() - 7);
              break;
            case '1 Month':
              cutoffDate.setMonth(now.getMonth() - 1);
              break;
            case '3 Months':
              cutoffDate.setMonth(now.getMonth() - 3);
              break;
            case '6 Months':
              cutoffDate.setMonth(now.getMonth() - 6);
              break;
            case '1 Year':
              cutoffDate.setFullYear(now.getFullYear() - 1);
              break;
            case '3 Years':
              cutoffDate.setFullYear(now.getFullYear() - 3);
              break;
            case 'More than 3 years':
              cutoffDate.setFullYear(now.getFullYear() - 3);
              filtered = filtered.filter(exam => exam.date < cutoffDate);
              return filtered;
          }
          
          if (filter.timeline !== 'More than 3 years') {
            filtered = filtered.filter(exam => exam.date >= cutoffDate);
          }
        }

        return filtered;
      })
    );
  }

  toggleBurgerMenu(): void {
    this.showBurgerMenu = !this.showBurgerMenu;
  }

  addBlock(blockType: string): void {
    const currentBlocks = this.visibleBlocksSubject.value;
    const blockExists = currentBlocks.find(block => block.type === blockType);
    
    if (!blockExists) {
      const newBlock: VisualPatientBlock = {
        id: Date.now().toString(),
        type: blockType as any,
        title: this.getBlockTitle(blockType),
        visible: true
      };
      
      this.visibleBlocksSubject.next([...currentBlocks, newBlock]);
    }
    
    this.showBurgerMenu = false;
  }

  removeBlock(blockId: string): void {
    const currentBlocks = this.visibleBlocksSubject.value;
    const updatedBlocks = currentBlocks.filter(block => block.id !== blockId);
    this.visibleBlocksSubject.next(updatedBlocks);
  }

  // Patient Records filtering
  setRecordsFilter(filter: string): void {
    this.recordsFilterSubject.next(filter);
  }

  // Graphic Filter methods
  setGraphicView(view: 'department' | 'anatomy'): void {
    const currentFilter = this.graphicFilterSubject.value;
    this.graphicFilterSubject.next({
      ...currentFilter,
      view
    });
  }

  setDepartmentFilter(department: string): void {
    const currentFilter = this.graphicFilterSubject.value;
    this.graphicFilterSubject.next({
      ...currentFilter,
      department
    });
  }

  setAnatomyFilter(anatomy: string): void {
    const currentFilter = this.graphicFilterSubject.value;
    this.graphicFilterSubject.next({
      ...currentFilter,
      anatomy
    });
  }

  setTimelineFilter(timeline: string): void {
    const currentFilter = this.graphicFilterSubject.value;
    this.graphicFilterSubject.next({
      ...currentFilter,
      timeline
    });
  }

  private getBlockTitle(blockType: string): string {
    const titles: { [key: string]: string } = {
      'patient-info': 'Patient Information',
      'radiological-request': 'Radiological Request',
      'ai-summary': 'IA Summary',
      'radio-report': 'Last Radio Report Conclusion',
      'patient-records': 'Top 10 Patient Record Information',
      'calendar-map': 'Calendar Map',
      'images-preview': 'All Images preview'
    };
    return titles[blockType] || blockType;
  }

  onRegionHover(region: string): void {
    this.hoveredRegion = region;
  }

  onRegionLeave(): void {
    this.hoveredRegion = null;
  }

  onExamPointHover(examPoint: ExamPoint, event: MouseEvent): void {
    this.hoveredExamPoint = examPoint;
    this.tooltipPosition = { x: event.clientX, y: event.clientY };
  }

  onExamPointLeave(): void {
    this.hoveredExamPoint = null;
  }

  getExamPointPosition(examPoint: ExamPoint, examPoints: ExamPoint[]): { x: number; y: number } {
    // Calculate position based on date and anatomical region
    const dates = examPoints.map(ep => ep.date.getTime()).sort((a, b) => a - b);
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    const dateRange = maxDate - minDate || 1;
    
    const x = ((examPoint.date.getTime() - minDate) / dateRange) * 85 + 10; // 10% margin, 85% width
    
    const regionIndex = this.anatomicalRegions.findIndex(region => 
      examPoint.anatomicalRegion.includes(region));
    const y = regionIndex >= 0 ? (regionIndex + 0.5) * (100 / this.anatomicalRegions.length) : 50;
    
    return { x, y };
  }

  getTimelineLabels(examPoints: ExamPoint[]): { label: string; position: number }[] {
    if (!examPoints.length) return [];
    
    const dates = examPoints.map(ep => ep.date).sort((a, b) => a.getTime() - b.getTime());
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    const dateRange = maxDate.getTime() - minDate.getTime() || 1;
    
    const labels: { label: string; position: number }[] = [];
    
    // Group exam dates by month/year
    const examsByMonth = new Map<string, Date[]>();
    examPoints.forEach(ep => {
      const monthKey = `${ep.date.getFullYear()}-${ep.date.getMonth()}`;
      if (!examsByMonth.has(monthKey)) {
        examsByMonth.set(monthKey, []);
      }
      examsByMonth.get(monthKey)!.push(ep.date);
    });
    
    // Create labels for months that have exams
    examsByMonth.forEach((monthDates, monthKey) => {
      const [year, month] = monthKey.split('-').map(Number);
      const monthDate = new Date(year, month, 1);
      const position = ((monthDate.getTime() - minDate.getTime()) / dateRange) * 85 + 10;
      
      labels.push({
        label: monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        position
      });
    });
    
    return labels.sort((a, b) => a.position - b.position);
  }

  openReportingWindow(): void {
    const reportingWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    if (reportingWindow) {
      // Charger le fichier HTML externe
      fetch('/src/app/reporting.html')
        .then(response => response.text())
        .then(htmlContent => {
          reportingWindow.document.open();
          reportingWindow.document.write(htmlContent);
          reportingWindow.document.close();
          reportingWindow.focus();
        })
        .catch(error => {
          console.error('Erreur lors du chargement du fichier reporting.html:', error);
          reportingWindow.close();
        });
    }
  }
      

  getTodayPosition(examPoints: ExamPoint[]): number {
    if (!examPoints.length) return 50;
    
    const dates = examPoints.map(ep => ep.date.getTime()).sort((a, b) => a - b);
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    const dateRange = maxDate - minDate || 1;
    const today = new Date().getTime();
    
    return ((today - minDate) / dateRange) * 85 + 10; // 10% margin, 85% width
  }

  onClose(): void {
    this.close.emit();
  }

  openReporting(examPoint?: ExamPoint, image?: any): void {
    console.log('Opening reporting for:', examPoint, image);
    this.openReportingWindow();
  }

  trackByBlockId(index: number, block: VisualPatientBlock): string {
    return block.id;
  }
}