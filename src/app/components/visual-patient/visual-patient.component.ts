import { Component, ChangeDetectionStrategy, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest, map, Subject, takeUntil } from 'rxjs';
import { VisualPatientService } from '../../services/visual-patient.service';
import { ConfigService } from '../../services/config.service';
import { ThemeService } from '../../services/theme.service';
import { PatientInfo, RadiologicalRequest, AISummary, RadioReport, PatientRecord, ExamPoint, ImagesByDate, VisualPatientBlock, GraphicFilter, Department, AnatomyRegion, MedicalImage } from '../../models/visual-patient.model';

@Component({
  selector: 'app-visual-patient',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visual-patient.component.html',
  styleUrl: './visual-patient.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisualPatientComponent implements OnInit, OnDestroy {
  @Input() selectedExamId?: string;
  @Output() close = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  // Observables for data
  patientInfo$!: Observable<PatientInfo>;
  radiologicalRequest$!: Observable<RadiologicalRequest>;
  aiSummary$!: Observable<AISummary>;
  radioReport$!: Observable<RadioReport>;
  patientRecords$!: Observable<PatientRecord[]>;
  examPoints$!: Observable<ExamPoint[]>;
  imagesByDate$!: Observable<ImagesByDate[]>;
  departments$!: Observable<Department[]>;
  anatomyRegions$!: Observable<AnatomyRegion[]>;

  // UI State
  showBurgerMenu = false;
  private visibleBlocksSubject = new BehaviorSubject<VisualPatientBlock[]>([]);
  visibleBlocks$ = this.visibleBlocksSubject.asObservable();

  // Records filter
  private recordsFilterSubject = new BehaviorSubject<string>('All');
  recordsFilter$ = this.recordsFilterSubject.asObservable();
  filteredPatientRecords$!: Observable<PatientRecord[]>;

  // Graphic filter
  private graphicFilterSubject = new BehaviorSubject<GraphicFilter>({
    view: 'department',
    department: 'ALL',
    anatomy: 'ALL',
    timeline: 'ALL'
  });
  graphicFilter$ = this.graphicFilterSubject.asObservable();
  filteredExamPoints$!: Observable<ExamPoint[]>;

  // Calendar map state
  hoveredRegion: string | null = null;
  hoveredExamPoint: ExamPoint | null = null;
  tooltipPosition = { x: 0, y: 0 };
  departmentsList: string[] = [];

  constructor(
    private visualPatientService: VisualPatientService,
    private configService: ConfigService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.initializeData();
    this.initializeFilters();
    this.loadDefaultBlocks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeData(): void {
    this.patientInfo$ = this.visualPatientService.getPatientInfo(this.selectedExamId);
    this.radiologicalRequest$ = this.visualPatientService.getRadiologicalRequest();
    this.aiSummary$ = this.visualPatientService.getAISummary();
    this.radioReport$ = this.visualPatientService.getRadioReport();
    this.patientRecords$ = this.visualPatientService.getPatientRecords();
    this.examPoints$ = this.visualPatientService.getExamPoints();
    this.imagesByDate$ = this.visualPatientService.getImagesByDate();
    this.departments$ = this.visualPatientService.getDepartments();
    this.anatomyRegions$ = this.visualPatientService.getAnatomyRegions();
  }

  private initializeFilters(): void {
    // Initialize filtered patient records
    this.filteredPatientRecords$ = combineLatest([
      this.patientRecords$,
      this.recordsFilter$
    ]).pipe(
      map(([records, filter]) => {
        if (filter === 'All') return records;
        return records.filter(record => {
          switch (filter) {
            case 'Imaging':
              return ['CT', 'MRI', 'X-RAY', 'Ultrasound', 'PET', 'Mammography'].some(type => 
                record.examName.includes(type));
            case 'Lab':
              return ['Lab', 'Blood', 'Biopsy'].some(type => 
                record.examName.includes(type));
            case 'Reports':
              return ['Report'].some(type => 
                record.examName.includes(type));
            default:
              return true;
          }
        });
      })
    );

    // Initialize filtered exam points
    this.filteredExamPoints$ = combineLatest([
      this.examPoints$,
      this.graphicFilter$
    ]).pipe(
      map(([examPoints, filter]) => {
        let filtered = [...examPoints];

        // Filter by department
        if (filter.view === 'department' && filter.department !== 'ALL') {
          filtered = filtered.filter(point => point.department === filter.department);
        }

        // Filter by anatomy
        if (filter.view === 'anatomy' && filter.anatomy !== 'ALL') {
          filtered = filtered.filter(point => point.anatomicalRegion === filter.anatomy);
        }

        // Filter by timeline
        if (filter.timeline !== 'ALL') {
          const now = new Date();
          const cutoffDate = this.getTimelineCutoffDate(filter.timeline, now);
          
          if (cutoffDate) {
            filtered = filtered.filter(point => point.date >= cutoffDate);
          }
        }

        return filtered;
      })
    );

    // Update departments list when exam points change
    this.filteredExamPoints$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(examPoints => {
      const currentFilter = this.graphicFilterSubject.value;
      if (currentFilter.view === 'department') {
        this.updateDepartmentsList(examPoints);
      }
    });
  }

  private getTimelineCutoffDate(timeline: string, now: Date): Date | null {
    switch (timeline) {
      case '1 Week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '1 Month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '3 Months':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '6 Months':
        return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      case '1 Year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      case '3 Years':
        return new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);
      case 'More than 3 years':
        return new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  }

  private loadDefaultBlocks(): void {
    this.visualPatientService.getDefaultBlocks().subscribe(blocks => {
      this.visibleBlocksSubject.next(blocks);
    });
  }

  private updateDepartmentsList(examPoints: ExamPoint[]): void {
    const departments = [...new Set(examPoints.map(point => point.department))].sort();
    this.departmentsList = departments;
  }

  trackByBlockId(index: number, block: VisualPatientBlock): string {
    return block.id;
  }

  onClose(): void {
    this.close.emit();
  }

  toggleBurgerMenu(): void {
    this.showBurgerMenu = !this.showBurgerMenu;
  }

  addBlock(blockType: string): void {
    const currentBlocks = this.visibleBlocksSubject.value;
    const blockExists = currentBlocks.some(block => block.type === blockType);
    
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

  private getBlockTitle(blockType: string): string {
    switch (blockType) {
      case 'patient-info': return 'Patient Information';
      case 'radiological-request': return 'Radiological Request';
      case 'ai-summary': return 'IA Summary';
      case 'radio-report': return 'Last Radio Report Conclusion';
      case 'patient-records': return 'Top 10 Patient Record Information';
      case 'calendar-map': return 'Calendar Map';
      case 'images-preview': return 'All Images preview';
      default: return 'Unknown Block';
    }
  }

  // Records filter methods
  setRecordsFilter(filter: string): void {
    this.recordsFilterSubject.next(filter);
  }

  // Graphic filter methods
  setGraphicView(view: 'department' | 'anatomy'): void {
    const currentFilter = this.graphicFilterSubject.value;
    this.graphicFilterSubject.next({ ...currentFilter, view });
  }

  setDepartmentFilter(department: string): void {
    const currentFilter = this.graphicFilterSubject.value;
    this.graphicFilterSubject.next({ ...currentFilter, department });
  }

  setAnatomyFilter(anatomy: string): void {
    const currentFilter = this.graphicFilterSubject.value;
    this.graphicFilterSubject.next({ ...currentFilter, anatomy });
  }

  setTimelineFilter(timeline: string): void {
    const currentFilter = this.graphicFilterSubject.value;
    this.graphicFilterSubject.next({ ...currentFilter, timeline });
  }

  // Calendar map methods
  getYAxisLabels(): Observable<string[]> {
    return combineLatest([
      this.graphicFilter$,
      this.departments$,
      this.anatomyRegions$,
      this.filteredExamPoints$
    ]).pipe(
      map(([filter, departments, anatomyRegions, examPoints]) => {
        if (filter.view === 'department') {
          const usedDepartments = [...new Set(examPoints.map(point => point.department))].sort();
          return usedDepartments;
        } else {
          const usedRegions = [...new Set(examPoints.map(point => point.anatomicalRegion))].sort();
          return usedRegions;
        }
      })
    );
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  isRegionFiltered(region: string): boolean {
    const currentFilter = this.graphicFilterSubject.value;
    if (currentFilter.view === 'department') {
      return currentFilter.department === region;
    } else {
      return currentFilter.anatomy === region;
    }
  }

  onRegionHover(region: string): void {
    this.hoveredRegion = region;
  }

  onRegionLeave(): void {
    this.hoveredRegion = null;
  }

  getTodayPosition(examPoints: ExamPoint[]): number {
    if (examPoints.length === 0) return 50;
    
    const dates = examPoints.map(point => point.date.getTime()).sort((a, b) => a - b);
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    const today = new Date().getTime();
    
    if (today <= minDate) return 0;
    if (today >= maxDate) return 100;
    
    return ((today - minDate) / (maxDate - minDate)) * 100;
  }

  getExamPointPosition(examPoint: ExamPoint, allExamPoints: ExamPoint[]): { x: number; y: number | string } {
    const currentFilter = this.graphicFilterSubject.value;
    
    // X position (time-based)
    const dates = allExamPoints.map(point => point.date.getTime()).sort((a, b) => a - b);
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    const examDate = examPoint.date.getTime();
    
    let xPosition = 0;
    if (maxDate > minDate) {
      xPosition = ((examDate - minDate) / (maxDate - minDate)) * 100;
    }
    
    // Y position (region-based)
    let yPosition: number | string = 0;
    
    if (currentFilter.view === 'department') {
      const departments = [...new Set(allExamPoints.map(point => point.department))].sort();
      const departmentIndex = departments.indexOf(examPoint.department);
      yPosition = (departmentIndex + 0.5) * 40; // 40px per department row
    } else {
      const regions = [...new Set(allExamPoints.map(point => point.anatomicalRegion))].sort();
      const regionIndex = regions.indexOf(examPoint.anatomicalRegion);
      const totalRegions = regions.length;
      yPosition = `${((regionIndex + 0.5) / totalRegions) * 100}%`;
    }
    
    return { x: xPosition, y: yPosition };
  }

  getTimelineLabels(examPoints: ExamPoint[]): { label: string; position: number }[] {
    if (examPoints.length === 0) return [];
    
    const dates = examPoints.map(point => point.date.getTime()).sort((a, b) => a - b);
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    
    const labels: { label: string; position: number }[] = [];
    
    // Add start date
    labels.push({
      label: new Date(minDate).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      position: 0
    });
    
    // Add end date
    labels.push({
      label: new Date(maxDate).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      position: 100
    });
    
    // Add today if it's within range
    const today = new Date().getTime();
    if (today >= minDate && today <= maxDate) {
      const todayPosition = ((today - minDate) / (maxDate - minDate)) * 100;
      labels.push({
        label: 'Today',
        position: todayPosition
      });
    }
    
    return labels;
  }

  onExamPointHover(examPoint: ExamPoint, event: MouseEvent): void {
    this.hoveredExamPoint = examPoint;
    this.tooltipPosition = {
      x: event.clientX,
      y: event.clientY
    };
  }

  onExamPointLeave(): void {
    // Don't immediately hide tooltip - let mouse move to tooltip
    setTimeout(() => {
      if (!this.isMouseOverTooltip) {
        this.hoveredExamPoint = null;
      }
    }, 100);
  }

  private isMouseOverTooltip = false;

  onTooltipEnter(): void {
    this.isMouseOverTooltip = true;
  }

  onTooltipLeave(): void {
    this.isMouseOverTooltip = false;
    this.hoveredExamPoint = null;
  }

  getExamThumbnails(examPoint: ExamPoint): MedicalImage[] {
    // Mock thumbnails for demonstration
    return [
      { id: '1', url: 'assets/public/images/radio/radio1.jpg', filename: 'scan_001.dcm' },
      { id: '2', url: 'assets/public/images/radio/radio2.jpg', filename: 'scan_002.dcm' },
      { id: '3', url: 'assets/public/images/radio/radio3.jpg', filename: 'scan_003.dcm' }
    ];
  }

  onDepartmentLabelsScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const chartVerticalScroll = document.querySelector('.chart-vertical-scroll') as HTMLElement;
    if (chartVerticalScroll) {
      chartVerticalScroll.scrollTop = target.scrollTop;
    }
  }

  onChartVerticalScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const departmentLabelsScroll = document.querySelector('.department-labels') as HTMLElement;
    if (departmentLabelsScroll) {
      departmentLabelsScroll.scrollTop = target.scrollTop;
    }
  }

  openReporting(examPoint?: ExamPoint, image?: MedicalImage): void {
    this.configService.getReportingWindowConfig().subscribe(windowConfig => {
      const reportingWindow = window.open(
        'src/app/reporting.html',
        'reportingWindow',
        `left=${windowConfig.left},top=${windowConfig.top},width=${windowConfig.width},height=${windowConfig.height},resizable=yes,scrollbars=yes`
      );

      if (reportingWindow) {
        // Register the window with theme service for theme synchronization
        this.themeService.registerReportingWindow(reportingWindow);

        // Save window position when it's moved or resized
        const savePosition = () => {
          this.configService.saveReportingWindowPosition(reportingWindow);
        };

        reportingWindow.addEventListener('beforeunload', () => {
          savePosition();
          this.themeService.unregisterReportingWindow(reportingWindow);
        });

        // Save position periodically while window is open
        const positionSaveInterval = setInterval(() => {
          if (reportingWindow.closed) {
            clearInterval(positionSaveInterval);
            this.themeService.unregisterReportingWindow(reportingWindow);
          } else {
            savePosition();
          }
        }, 5000); // Save every 5 seconds
      }
    });
  }
}