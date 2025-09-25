import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest, map, Subscription } from 'rxjs';
import { VisualPatientService } from '../../services/visual-patient.service';
import { ConfigService } from '../../services/config.service';
import { 
  PatientInfo, 
  RadiologicalRequest, 
  AISummary, 
  RadioReport, 
  PatientRecord, 
  ExamPoint, 
  ImagesByDate, 
  VisualPatientBlock,
  GraphicFilter,
  Department,
  AnatomyRegion,
  MedicalImage
} from '../../models/visual-patient.model';

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
  private allBlocksSubject = new BehaviorSubject<VisualPatientBlock[]>([]);
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

  private subscriptions: Subscription[] = [];

  constructor(
    private visualPatientService: VisualPatientService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    // Load data
    this.patientInfo$ = this.visualPatientService.getPatientInfo(this.selectedExamId);
    this.radiologicalRequest$ = this.visualPatientService.getRadiologicalRequest();
    this.aiSummary$ = this.visualPatientService.getAISummary();
    this.radioReport$ = this.visualPatientService.getRadioReport();
    this.patientRecords$ = this.visualPatientService.getPatientRecords();
    this.examPoints$ = this.visualPatientService.getExamPoints();
    this.imagesByDate$ = this.visualPatientService.getImagesByDate();
    this.departments$ = this.visualPatientService.getDepartments();
    this.anatomyRegions$ = this.visualPatientService.getAnatomyRegions();

    // Initialize blocks
    this.visualPatientService.getDefaultBlocks().subscribe(blocks => {
      this.allBlocksSubject.next(blocks);
      this.visibleBlocksSubject.next(blocks.filter(block => block.visible));
    });

    // Setup filtered records
    this.filteredPatientRecords$ = combineLatest([
      this.patientRecords$,
      this.recordsFilter$
    ]).pipe(
      map(([records, filter]) => {
        if (filter === 'All') return records;
        return records.filter(record => {
          switch (filter) {
            case 'Imaging': return ['CT', 'MRI', 'X-Ray', 'Ultrasound', 'Mammography'].some(type => record.examName.includes(type));
            case 'Lab': return record.examName.includes('Lab') || record.examName.includes('Blood');
            case 'Reports': return record.examName.includes('Report');
            default: return true;
          }
        });
      })
    );

    // Setup filtered exam points
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
              filtered = filtered.filter(point => point.date < cutoffDate);
              return filtered;
          }
          
          if (filter.timeline !== 'More than 3 years') {
            filtered = filtered.filter(point => point.date >= cutoffDate);
          }
        }

        return filtered;
      })
    );

    // Setup departments list for calendar map
    const sub = this.examPoints$.subscribe(examPoints => {
      const departments = [...new Set(examPoints.map(point => point.department))].sort();
      this.departmentsList = departments;
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onClose(): void {
    this.close.emit();
  }

  toggleBurgerMenu(): void {
    this.showBurgerMenu = !this.showBurgerMenu;
  }

  addBlock(blockType: string): void {
    const allBlocks = this.allBlocksSubject.value;
    const block = allBlocks.find(b => b.type === blockType);
    if (block && !block.visible) {
      block.visible = true;
      this.visibleBlocksSubject.next(allBlocks.filter(b => b.visible));
    }
    this.showBurgerMenu = false;
  }

  removeBlock(blockId: string): void {
    const allBlocks = this.allBlocksSubject.value;
    const block = allBlocks.find(b => b.id === blockId);
    if (block) {
      block.visible = false;
      this.visibleBlocksSubject.next(allBlocks.filter(b => b.visible));
    }
  }

  trackByBlockId(index: number, block: VisualPatientBlock): string {
    return block.id;
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
      this.anatomyRegions$
    ]).pipe(
      map(([filter, departments, anatomyRegions]) => {
        if (filter.view === 'department') {
          return departments.map(dept => dept.name);
        } else {
          const regions = anatomyRegions.map(region => region.name);
          return [...regions, 'Others'];
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
    const pointDate = examPoint.date.getTime();
    
    let xPercent = 50; // Default center
    if (maxDate > minDate) {
      xPercent = ((pointDate - minDate) / (maxDate - minDate)) * 100;
    }
    
    // Y position (department or anatomy based)
    let yPosition: number | string = 50;
    
    if (currentFilter.view === 'department') {
      const departmentIndex = this.departmentsList.indexOf(examPoint.department);
      if (departmentIndex !== -1) {
        yPosition = (departmentIndex * 40) + 20; // 40px per department, centered
      }
    } else {
      // Anatomy view - map anatomical regions to percentages
      const anatomyMap: { [key: string]: number } = {
        'Head - Shoulder': 15,
        'Shoulder - Upper Limb': 35,
        'Upper Limb - Pelvis': 55,
        'Pelvis - Lower Limb': 75,
        'Lower Limb - Foot': 90,
        'Others': 95
      };
      
      yPosition = `${anatomyMap[examPoint.anatomicalRegion] || anatomyMap['Others']}%`;
    }
    
    return { x: xPercent, y: yPosition };
  }

  getTimelineLabels(examPoints: ExamPoint[]): { label: string; position: number }[] {
    if (examPoints.length === 0) return [];
    
    const dates = examPoints.map(point => point.date.getTime()).sort((a, b) => a - b);
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    
    const labels: { label: string; position: number }[] = [];
    
    // Add min date
    labels.push({
      label: new Date(minDate).getFullYear().toString(),
      position: 0
    });
    
    // Add today if within range
    const today = new Date().getTime();
    if (today >= minDate && today <= maxDate) {
      const todayPosition = ((today - minDate) / (maxDate - minDate)) * 100;
      labels.push({
        label: 'Today',
        position: todayPosition
      });
    }
    
    // Add max date
    labels.push({
      label: new Date(maxDate).getFullYear().toString(),
      position: 100
    });
    
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
    this.hoveredExamPoint = null;
  }

  onTooltipEnter(): void {
    // Keep tooltip visible when hovering over it
  }

  onTooltipLeave(): void {
    this.hoveredExamPoint = null;
  }

  getExamThumbnails(examPoint: ExamPoint): { url: string; filename: string }[] {
    // Mock thumbnails for demonstration
    return [
      { url: 'assets/public/images/radio/radio1.jpg', filename: 'scan_001.dcm' },
      { url: 'assets/public/images/radio/radio2.jpg', filename: 'scan_002.dcm' }
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
    const departmentLabels = document.querySelector('.department-labels') as HTMLElement;
    if (departmentLabels) {
      departmentLabels.scrollTop = target.scrollTop;
    }
  }

  openReporting(examPoint?: ExamPoint, image?: MedicalImage): void {
    // Réutilise la fenêtre reporting existante
    const reportingWindow = window.open('', 'reportingWindow');
    
    if (reportingWindow) {
      reportingWindow.focus();
      
      // Load reporting content
      this.visualPatientService.getReportingData().subscribe(reportingData => {
        this.configService.getReportingImagesConfig().subscribe(imagesConfig => {
          this.loadReportingContent(reportingWindow, reportingData, imagesConfig);
        });
      });
    }
  }

  private loadReportingContent(reportingWindow: Window, reportingData: any, imagesConfig: any): void {
    const reportingHtml = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Medical Reporting - Clinique du Parc</title>
              <style>
                * {
                  box-sizing: border-box;
                  margin: 0;
                  padding: 0;
                }
                
                body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  margin: 0; 
                  padding: 20px; 
                  background: #f8f9fa;
                  color: #333;
                  line-height: 1.6;
                }
                
                .container {
                  max-width: 1200px;
                  margin: 0 auto;
                }
                
                .header { 
                  display: flex; 
                  justify-content: space-between; 
                  align-items: center; 
                  margin-bottom: 30px; 
                  padding-bottom: 20px;
                  border-bottom: 2px solid #14B8A6;
                }
                
                .logo { 
                  font-size: 24px; 
                  font-weight: bold; 
                  color: #14B8A6;
                }
                
                .subtitle {
                  color: #666; 
                  font-size: 14px;
                }
                
                .patient-info { 
                  display: flex; 
                  justify-content: space-between; 
                  margin-bottom: 30px;
                  background: white;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  gap: 20px;
                }
                
                .info-section { 
                  flex: 1;
                }
                
                .info-section h3 { 
                  margin: 0 0 15px 0; 
                  color: #14B8A6; 
                  font-size: 18px;
                  font-weight: 600;
                }
                
                .info-row { 
                  margin-bottom: 8px; 
                  display: flex;
                  align-items: flex-start;
                }
                
                .label { 
                  font-weight: 600; 
                  color: #666; 
                  display: inline-block; 
                  width: 120px;
                  flex-shrink: 0;
                }
                
                .value {
                  flex: 1;
                  color: #333;
                }
                
                .report-section { 
                  margin-bottom: 20px;
                  background: white;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .section-header { 
                  background: #14B8A6; 
                  color: white; 
                  padding: 12px 20px; 
                  font-weight: 600;
                  text-transform: uppercase;
                  font-size: 14px;
                  letter-spacing: 0.5px;
                }
                
                .section-content { 
                  padding: 20px; 
                }
                
                textarea { 
                  width: 100%; 
                  min-height: 100px; 
                  border: 1px solid #ddd; 
                  border-radius: 4px; 
                  padding: 12px; 
                  font-family: inherit; 
                  font-size: 14px;
                  resize: vertical;
                  line-height: 1.5;
                  background: #fff;
                }
                
                textarea:focus { 
                  outline: none; 
                  border-color: #14B8A6; 
                  box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.1);
                }
                
                .actions { 
                  display: flex; 
                  gap: 15px; 
                  justify-content: center; 
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #eee;
                  flex-wrap: wrap;
                }
                
                .btn { 
                  padding: 12px 24px; 
                  border: none; 
                  border-radius: 6px; 
                  font-weight: 600; 
                  cursor: pointer; 
                  transition: all 0.2s;
                  font-size: 14px;
                  min-width: 120px;
                }
                
                .btn:hover {
                  transform: translateY(-1px);
                  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }
                
                .btn-secondary { 
                  background: #6c757d; 
                  color: white; 
                }
                
                .btn-secondary:hover { 
                  background: #5a6268; 
                }
                
                .btn-warning { 
                  background: #ffc107; 
                  color: #212529; 
                }
                
                .btn-warning:hover { 
                  background: #e0a800; 
                }
                
                .btn-primary { 
                  background: #14B8A6; 
                  color: white; 
                }
                
                .btn-primary:hover { 
                  background: #0f9488; 
                }
                
                .btn-success { 
                  background: #28a745; 
                  color: white; 
                }
                
                .btn-success:hover { 
                  background: #218838; 
                }

                /* Findings Matrix Styles */
                .findings-matrix {
                  display: flex;
                  flex-direction: column;
                  gap: 15px;
                }

                .matrix-header {
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr;
                  gap: 15px;
                }

                .matrix-row {
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr;
                  gap: 15px;
                  align-items: start;
                }

                .matrix-cell {
                  background: white;
                  border-radius: 8px;
                  padding: 15px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .header-cell {
                  background: #14B8A6;
                  color: white;
                  text-align: center;
                  font-weight: 600;
                  font-size: 14px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }

                .image-cell {
                  text-align: center;
                }

                .medical-image-container {
                  position: relative;
                  background: #2c3e50;
                  border-radius: 8px;
                  overflow: hidden;
                  aspect-ratio: 1;
                  margin-bottom: 10px;
                }

                .medical-scan {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  filter: grayscale(100%) contrast(1.2);
                }

                .measurement-overlay {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  color: #ffd700;
                  font-weight: bold;
                  font-size: 12px;
                }

                .measurement-line {
                  width: 40px;
                  height: 2px;
                  background: #ffd700;
                  margin: 0 auto 4px;
                  position: relative;
                }

                .measurement-line::before,
                .measurement-line::after {
                  content: '';
                  position: absolute;
                  width: 2px;
                  height: 8px;
                  background: #ffd700;
                  top: -3px;
                }

                .measurement-line::before {
                  left: 0;
                }

                .measurement-line::after {
                  right: 0;
                }

                .measurement-value {
                  text-align: center;
                  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
                }

                .image-label {
                  font-size: 12px;
                  color: #666;
                  font-weight: 500;
                }

                .chart-cell {
                  background: #2c3e50;
                  color: white;
                }

                .chart-title {
                  text-align: center;
                  font-weight: 600;
                  margin-bottom: 10px;
                  color: #ecf0f1;
                  font-size: 14px;
                }

                .chart-container {
                  display: flex;
                  flex-direction: column;
                  height: 100%;
                }

                .evolution-chart {
                  width: 100%;
                  height: 120px;
                  background: #34495e;
                  border-radius: 4px;
                  margin-bottom: 10px;
                }

                .chart-stats {
                  display: flex;
                  justify-content: space-around;
                  gap: 10px;
                }

                .stat-value {
                  font-size: 12px;
                  font-weight: 600;
                  padding: 4px 8px;
                  border-radius: 4px;
                  background: #34495e;
                }

                .stat-value.decrease {
                  color: #2ecc71;
                  background: rgba(46, 204, 113, 0.2);
                }

                .stat-value.increase {
                  color: #e74c3c;
                  background: rgba(231, 76, 60, 0.2);
                }

                .stat-value.stable {
                  color: #f39c12;
                  background: rgba(243, 156, 18, 0.2);
                }
                
                @media (max-width: 768px) {
                  .patient-info {
                    flex-direction: column;
                  }
                  
                  .actions {
                    flex-direction: column;
                    align-items: center;
                  }
                  
                  .btn {
                    width: 100%;
                    max-width: 300px;
                  }
                  
                  .matrix-header,
                  .matrix-row {
                    grid-template-columns: 1fr;
                  }
                  
                  .findings-matrix {
                    gap: 10px;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">🏥 Clinique du Parc</div>
                  <div class="subtitle">Medical Reporting System</div>
                </div>
                
                <div class="patient-info">
                  <div class="info-section">
                    <h3>Patient Information</h3>
                    <div class="info-row">
                      <span class="label">Name:</span>
                      <span class="value">${reportingData.patient.firstName} ${reportingData.patient.lastName}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Date of Birth:</span>
                      <span class="value">${reportingData.patient.dateOfBirth.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Address:</span>
                      <span class="value">${reportingData.patient.address}</span>
                    </div>
                  </div>
                  
                  <div class="info-section">
                    <h3>Prescribing Doctor</h3>
                    <div class="info-row">
                      <span class="label">Name:</span>
                      <span class="value">${reportingData.prescribingDoctor.name}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Specialty:</span>
                      <span class="value">${reportingData.prescribingDoctor.specialty}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Hospital:</span>
                      <span class="value">${reportingData.prescribingDoctor.hospital}</span>
                    </div>
                  </div>
                </div>
                
                <div class="report-section">
                  <div class="section-header">Indication</div>
                  <div class="section-content">
                    <textarea placeholder="Enter indication...">${reportingData.reportSections.indication}</textarea>
                  </div>
                </div>
                
                <div class="report-section">
                  <div class="section-header">Technical Information</div>
                  <div class="section-content">
                    <textarea placeholder="Enter technical information...">${reportingData.reportSections.technicalInformation}</textarea>
                  </div>
                </div>
                
                <div class="report-section">
                  <div class="section-header">Report</div>
                  <div class="section-content">
                    <textarea placeholder="Enter report...">${reportingData.reportSections.report}</textarea>
                  </div>
                </div>
                
                <div class="report-section">
                  <div class="section-header">Conclusion</div>
                  <div class="section-content">
                    <textarea placeholder="Enter conclusion...">${reportingData.reportSections.conclusion}</textarea>
                  </div>
                </div>
                
                <div class="report-section">
                  <div class="section-header">Billing</div>
                  <div class="section-content">
                    <textarea placeholder="Enter billing information...">${reportingData.reportSections.billing}</textarea>
                  </div>
                </div>
                
                <div class="report-section">
                  <div class="section-header">Findings</div>
                  <div class="section-content">
                    <div class="findings-matrix">
                      <!-- Header Row -->
                      <div class="matrix-header">
                        <div class="matrix-cell header-cell">6 months ago</div>
                        <div class="matrix-cell header-cell">Today</div>
                        <div class="matrix-cell header-cell">Evolution</div>
                      </div>
                      
                      <!-- Nodule 1 Row -->
                      <div class="matrix-row">
                        <div class="matrix-cell image-cell">
                          <div class="medical-image-container">
                            <img src="${imagesConfig.nodule1Baseline}" 
                                 alt="Medical scan 6 months ago" class="medical-scan">
                            <div class="measurement-overlay">
                              <div class="measurement-line"></div>
                              <div class="measurement-value">15.2mm</div>
                            </div>
                          </div>
                          <div class="image-label">Nodule 1 - Baseline</div>
                        </div>
                        
                        <div class="matrix-cell image-cell">
                          <div class="medical-image-container">
                            <img src="${imagesConfig.nodule1Current}" 
                                 alt="Medical scan today" class="medical-scan">
                            <div class="measurement-overlay">
                              <div class="measurement-line"></div>
                              <div class="measurement-value">14.2mm</div>
                            </div>
                          </div>
                          <div class="image-label">Nodule 1 - Current</div>
                        </div>
                        
                        <div class="matrix-cell chart-cell">
                          <div class="chart-container">
                            <div class="chart-title">Nodule 1</div>
                            <svg class="evolution-chart" viewBox="0 0 200 100">
                              <!-- Grid lines -->
                              <defs>
                                <pattern id="grid1" width="20" height="10" patternUnits="userSpaceOnUse">
                                  <path d="M 20 0 L 0 0 0 10" fill="none" stroke="#444" stroke-width="0.5"/>
                                </pattern>
                              </defs>
                              <rect width="200" height="100" fill="url(#grid1)" />
                              
                              <!-- Evolution line for Nodule 1: 15.2 -> 14.6 -> 14.2 -->
                              <circle cx="30" cy="30" r="3" fill="#ff6b6b"/>
                              <line x1="30" y1="30" x2="100" y2="40" stroke="#ff6b6b" stroke-width="2"/>
                              <circle cx="100" cy="40" r="3" fill="#ff6b6b"/>
                              <line x1="100" y1="40" x2="170" y2="45" stroke="#ff6b6b" stroke-width="2"/>
                              <circle cx="170" cy="45" r="4" fill="#ff6b6b" stroke="#fff" stroke-width="2"/>
                            </svg>
                            <div class="chart-stats">
                              <span class="stat-value decrease">-6.6%</span>
                              <span class="stat-value decrease">-1.0mm</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Nodule 2 Row -->
                      <div class="matrix-row">
                        <div class="matrix-cell image-cell">
                          <div class="medical-image-container">
                            <img src="${imagesConfig.nodule2Baseline}" 
                                 alt="Medical scan 6 months ago" class="medical-scan">
                            <div class="measurement-overlay">
                              <div class="measurement-line"></div>
                              <div class="measurement-value">12.8mm</div>
                            </div>
                          </div>
                          <div class="image-label">Nodule 2 - Baseline</div>
                        </div>
                        
                        <div class="matrix-cell image-cell">
                          <div class="medical-image-container">
                            <img src="${imagesConfig.nodule2Current}" 
                                 alt="Medical scan today" class="medical-scan">
                            <div class="measurement-overlay">
                              <div class="measurement-line"></div>
                              <div class="measurement-value">10.0mm</div>
                            </div>
                          </div>
                          <div class="image-label">Nodule 2 - Current</div>
                        </div>
                        
                        <div class="matrix-cell chart-cell">
                          <div class="chart-container">
                            <div class="chart-title">Nodule 2</div>
                            <svg class="evolution-chart" viewBox="0 0 200 100">
                              <!-- Grid lines -->
                              <defs>
                                <pattern id="grid2" width="20" height="10" patternUnits="userSpaceOnUse">
                                  <path d="M 20 0 L 0 0 0 10" fill="none" stroke="#444" stroke-width="0.5"/>
                                </pattern>
                              </defs>
                              <rect width="200" height="100" fill="url(#grid2)" />
                              
                              <!-- Evolution line for Nodule 2: 12.8 -> 10.4 -> 10.0 -->
                              <circle cx="30" cy="35" r="3" fill="#ff6b6b"/>
                              <line x1="30" y1="35" x2="100" y2="55" stroke="#ff6b6b" stroke-width="2"/>
                              <circle cx="100" cy="55" r="3" fill="#ff6b6b"/>
                              <line x1="100" y1="55" x2="170" y2="60" stroke="#ff6b6b" stroke-width="2"/>
                              <circle cx="170" cy="60" r="4" fill="#ff6b6b" stroke="#fff" stroke-width="2"/>
                            </svg>
                            <div class="chart-stats">
                              <span class="stat-value decrease">-21.9%</span>
                              <span class="stat-value decrease">-2.8mm</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="actions">
                  <button class="btn btn-secondary" onclick="window.close()">Second Opinion</button>
                  <button class="btn btn-warning" onclick="window.close()">On Hold</button>
                  <button class="btn btn-primary" onclick="window.close()">Sign</button>
                  <button class="btn btn-success" onclick="window.close()">Sign & Next</button>
                </div>
              </div>
            </body>
            </html>
          `;
          
          reportingWindow.document.open();
          reportingWindow.document.write(reportingHtml);
          reportingWindow.document.close();
  }

  openViewer(examPoint?: ExamPoint, image?: MedicalImage): void {
    // Réutilise la fenêtre viewer existante
    const viewerWindow = window.open('', 'viewerWindow');
    
    if (viewerWindow) {
      viewerWindow.focus();
      
      // Load viewer URL
      this.configService.getViewerConfig().subscribe(viewerConfig => {
        viewerWindow.location.href = viewerConfig.url;
      });
    }
  }
}