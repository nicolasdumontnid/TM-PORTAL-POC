import { Component, ChangeDetectionStrategy, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest, map, of } from 'rxjs';
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
    timeline: '3 Years'
  });
  graphicFilter$ = this.graphicFilterSubject.asObservable();
  filteredExamPoints$!: Observable<ExamPoint[]>;
  departments$!: Observable<Department[]>;
  anatomyRegions$!: Observable<AnatomyRegion[]>;

  showBurgerMenu = false;
  hoveredRegion: string | null = null;
  hoveredExamPoint: ExamPoint | null = null;
  tooltipPosition = { x: 0, y: 0 };
  
  @ViewChild('departmentLabelsScroll') departmentLabelsScroll!: ElementRef;
  @ViewChild('chartVerticalScroll') chartVerticalScroll!: ElementRef;

  anatomicalRegions = [
    'Head',
    'Shoulder', 
    'Upper Limb',
    'Pelvis',
    'Lower Limb'
  ];

  departmentsList = [
    'Cardiology',
    'Emergency',
    'Gastroenterology',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pulmonology',
    'Radiology'
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

  isRegionFiltered(label: string): boolean {
    const currentFilter = this.graphicFilterSubject.value;
    
    if (currentFilter.view === 'department') {
      return currentFilter.department !== 'ALL' && currentFilter.department === label;
    } else {
      return currentFilter.anatomy !== 'ALL' && currentFilter.anatomy === label;
    }
  }

  isRegionFiltered(label: string): boolean {
    const currentFilter = this.graphicFilterSubject.value;
    
    if (currentFilter.view === 'department') {
      return currentFilter.department !== 'ALL' && currentFilter.department === label;
    } else {
      return currentFilter.anatomy !== 'ALL' && currentFilter.anatomy === label;
    }
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
    
    const currentFilter = this.graphicFilterSubject.value;
    let yPosition: number = 0;
    
    if (currentFilter.view === 'department') {
      // Use the complete department list to maintain consistent positioning
      const deptIndex = this.departmentsList.indexOf(examPoint.department);
      if (deptIndex >= 0) {
        // Position in pixels: center of each 40px department row
        yPosition = (deptIndex * 40) + 20; // 20px to center in the 40px row
      } else {
        yPosition = 20; // Default to first row if not found
      }
    } else {
      // Find anatomical region index
      const regionIndex = this.anatomicalRegions.findIndex(region => 
        examPoint.anatomicalRegion.includes(region));
      const validIndex = regionIndex >= 0 ? regionIndex : 0;
      const totalLabels = this.anatomicalRegions.length;
      yPosition = (validIndex + 0.5) * (100 / totalLabels);
    }
    
    return { x, y: yPosition };
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
    const reportingWindow = window.open('about:blank', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    if (reportingWindow) {
      // Create a complete HTML document with Angular component
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Medical Reporting - Clinique du Parc</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body { 
              font-family: 'Poppins', sans-serif; 
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
            
            .template-selector {
              display: flex;
              align-items: center;
            }
            
            .template-dropdown {
              padding: 8px 12px;
              border: 1px solid #ddd;
              border-radius: 6px;
              background: white;
              color: #333;
              font-family: inherit;
              font-size: 14px;
              cursor: pointer;
              min-width: 200px;
              transition: border-color 0.2s ease;
            }
            
            .template-dropdown:focus {
              outline: none;
              border-color: #14B8A6;
              box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.1);
            }
            
            .template-dropdown:hover {
              border-color: #14B8A6;
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
              background: #6c757d !important; 
              color: white !important; 
            }
            
            .btn-secondary:hover { 
              background: #5a6268 !important; 
            }
            
            .btn-warning { 
              background: #6c757d !important; 
              color: white !important; 
            }
            
            .btn-warning:hover { 
              background: #5a6268 !important; 
            }
            
            .btn-primary { 
              background: #28a745 !important; 
              color: white !important; 
            }
            
            .btn-primary:hover { 
              background: #218838 !important; 
            }
            
            .btn-success { 
              background: #28a745 !important; 
              color: white !important; 
            }
            
            .btn-success:hover { 
              background: #218838 !important; 
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
              <div class="template-selector">
                <select id="templateSelect" class="template-dropdown" onchange="onTemplateChange()">
                  <option value="">Select template...</option>
                  <option value="CT Chest negative">CT Chest negative</option>
                  <option value="CT Chest positive">CT Chest positive</option>
                </select>
              </div>
            </div>
            
            <div class="patient-info">
              <div class="info-section">
                <h3>Patient Information</h3>
                <div class="info-row">
                  <span class="label">Name:</span>
                  <span class="value">Jean Dupont</span>
                </div>
                <div class="info-row">
                  <span class="label">Date of Birth:</span>
                  <span class="value">March 15, 1975</span>
                </div>
                <div class="info-row">
                  <span class="label">Address:</span>
                  <span class="value">123 Rue de la Paix, 75001 Paris, France</span>
                </div>
              </div>
              
              <div class="info-section">
                <h3>Prescribing Doctor</h3>
                <div class="info-row">
                  <span class="label">Name:</span>
                  <span class="value">Dr. Marie Dubois</span>
                </div>
                <div class="info-row">
                  <span class="label">Specialty:</span>
                  <span class="value">Oncologist</span>
                </div>
                <div class="info-row">
                  <span class="label">Hospital:</span>
                  <span class="value">Clinique du Parc</span>
                </div>
              </div>
            </div>
            
            <div class="report-section">
              <div class="section-header">Indication</div>
              <div class="section-content">
                <textarea id="indication" placeholder="Enter indication...">Cancer staging, six months after chemotherapy</textarea>
              </div>
            </div>
            
            <div class="report-section">
              <div class="section-header">Technical Information</div>
              <div class="section-content">
                <textarea id="technicalInformation" placeholder="Enter technical information...">CT scan of the abdomen with IV contrast. Slice thickness: 5mm. Reconstruction: axial, coronal, and sagittal planes.</textarea>
              </div>
            </div>
            
            <div class="report-section">
              <div class="section-header">Report</div>
              <div class="section-content">
                <textarea id="report" placeholder="Enter report...">The CT scan shows marked improvement compared to previous studies. The previously identified lesion in the upper right quadrant has decreased in size by approximately 40%.</textarea>
              </div>
            </div>
            
            <div class="report-section">
              <div class="section-header">Conclusion</div>
              <div class="section-content">
                <textarea id="conclusion" placeholder="Enter conclusion...">Significant improvement following chemotherapy treatment. No new metastatic lesions detected. Continue current treatment protocol.</textarea>
              </div>
            </div>
            
            <div class="report-section">
              <div class="section-header">Billing</div>
              <div class="section-content">
                <textarea id="billing" placeholder="Enter billing information...">CT Abdomen with contrast - Code: 74177</textarea>
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
                        <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
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
                        <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
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
                          <defs>
                            <pattern id="grid1" width="20" height="10" patternUnits="userSpaceOnUse">
                              <path d="M 20 0 L 0 0 0 10" fill="none" stroke="#444" stroke-width="0.5"/>
                            </pattern>
                          </defs>
                          <rect width="200" height="100" fill="url(#grid1)" />
                          
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
                        <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
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
                        <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
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
                          <defs>
                            <pattern id="grid2" width="20" height="10" patternUnits="userSpaceOnUse">
                              <path d="M 20 0 L 0 0 0 10" fill="none" stroke="#444" stroke-width="0.5"/>
                            </pattern>
                          </defs>
                          <rect width="200" height="100" fill="url(#grid2)" />
                          
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
              <button class="btn btn-secondary" onclick="onSecondOpinion()">Second Opinion</button>
              <button class="btn btn-warning" onclick="onHold()">On Hold</button>
              <button class="btn btn-primary" onclick="onSign()">Sign</button>
              <button class="btn btn-success" onclick="onSignAndNext()">Sign & Next</button>
            </div>
          </div>
          
          <script>
            function onTemplateChange() {
              const select = document.getElementById('templateSelect');
              const selectedTemplate = select.value;
              
              if (selectedTemplate === 'CT Chest negative') {
                document.getElementById('indication').value = 'Routine chest CT scan for annual screening';
                document.getElementById('technicalInformation').value = 'CT scan of the chest without contrast. Slice thickness: 1.25mm. Reconstruction: axial, coronal, and sagittal planes. Inspiration breath-hold technique.';
                document.getElementById('report').value = 'The chest CT demonstrates normal lung parenchyma bilaterally. No pulmonary nodules, masses, or consolidations are identified. The mediastinal structures appear normal with no lymphadenopathy. Heart size is within normal limits. No pleural effusion or pneumothorax.';
                document.getElementById('conclusion').value = 'Normal chest CT examination. No evidence of pulmonary pathology. Recommend routine follow-up as clinically indicated.';
                document.getElementById('billing').value = 'CT Chest without contrast - Code: 71250';
              } else if (selectedTemplate === 'CT Chest positive') {
                document.getElementById('indication').value = 'Evaluation of persistent cough and chest pain';
                document.getElementById('technicalInformation').value = 'CT scan of the chest with IV contrast. Slice thickness: 1.25mm. Reconstruction: axial, coronal, and sagittal planes. Post-contrast images obtained.';
                document.getElementById('report').value = 'The chest CT reveals a 2.3 cm spiculated nodule in the right upper lobe with associated pleural retraction. Multiple smaller nodules are noted in both lungs, the largest measuring 8mm in the left lower lobe. Mediastinal lymphadenopathy is present with enlarged paratracheal and subcarinal nodes.';
                document.getElementById('conclusion').value = 'Findings highly suspicious for primary lung malignancy with metastatic disease. Recommend urgent oncology consultation and tissue sampling for definitive diagnosis.';
                document.getElementById('billing').value = 'CT Chest with contrast - Code: 71260';
              }
            }
            
            function onSecondOpinion() {
              console.log('Second Opinion requested');
            }
            
            function onHold() {
              console.log('Report put on hold');
            }
            
            function onSign() {
              console.log('Report signed');
            }
            
            function onSignAndNext() {
              console.log('Report signed and moving to next');
            }
          </script>
        </body>
        </html>
      `;
      
      reportingWindow.document.open();
      reportingWindow.document.write(htmlContent);
      reportingWindow.document.close();
      reportingWindow.focus();
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

  getYAxisLabels(): Observable<string[]> {
    const currentFilter = this.graphicFilterSubject.value;
    
    if (currentFilter.view === 'department') {
      // Return static department list to ensure labels are always available
      return of(this.departmentsList);
    } else {
      // Return anatomical regions
      return of(this.anatomicalRegions);
    }
  }

  // Alternative method that uses filtered data but with fallback
  getYAxisLabelsFromData(): Observable<string[]> {
    const currentFilter = this.graphicFilterSubject.value;
    
    if (currentFilter.view === 'department') {
      // Get unique departments from exam data with fallback
      return this.filteredExamPoints$.pipe(
        map(examPoints => {
          if (!examPoints || examPoints.length === 0) {
            // Fallback to static list if no filtered data
            return this.departmentsList;
          }
          const uniqueDepartments = [...new Set(examPoints.map(ep => ep.department))].sort();
          return uniqueDepartments.length > 0 ? uniqueDepartments : this.departmentsList;
        })
      );
    } else {
      // Return anatomical regions
      return of(this.anatomicalRegions);
    }
  }

  getExamThumbnails(examPoint: ExamPoint): { url: string; filename: string }[] {
    // Mock thumbnails based on exam type - in real app, this would come from the exam data
    const mockThumbnails = [
      { url: 'https://i.ibb.co/JqjTz3j/scan-thumb-1.png', filename: 'axial_1.dcm' },
      { url: 'https://i.ibb.co/9gZ2YjM/scan-thumb-2.png', filename: 'axial_2.dcm' },
      { url: 'https://i.ibb.co/yQdZn5P/scan-thumb-3.png', filename: 'sagittal_1.dcm' }
    ];
    
    // Return 2-3 random thumbnails for demo
    return mockThumbnails.slice(0, Math.floor(Math.random() * 2) + 2);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  onDepartmentLabelsScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.chartVerticalScroll && this.chartVerticalScroll.nativeElement) {
      this.chartVerticalScroll.nativeElement.scrollTop = target.scrollTop;
    }
  }

  onChartVerticalScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.departmentLabelsScroll && this.departmentLabelsScroll.nativeElement) {
      this.departmentLabelsScroll.nativeElement.scrollTop = target.scrollTop;
    }
  }
}