import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ExamPoint, GraphicFilter, Department, AnatomyRegion } from '../../../../models/visual-patient.model';

@Component({
  selector: 'app-calendar-map-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- GRAPHIC_FILTER Component -->
    <div class="graphic-filter">
      <!-- View Line -->
      <div class="filter-line">
        <span class="filter-label">View</span>
        <div class="filter-buttons">
          <button 
            class="filter-btn"
            [class.active]="(graphicFilter$ | async)?.view === 'department'"
            (click)="onGraphicViewChange('department')"
          >By Department</button>
          <button 
            class="filter-btn"
            [class.active]="(graphicFilter$ | async)?.view === 'anatomy'"
            (click)="onGraphicViewChange('anatomy')"
          >By Anatomy</button>
        </div>
      </div>

      <!-- Departments Line -->
      <div 
        class="filter-line"
        *ngIf="(graphicFilter$ | async)?.view === 'department'"
      >
        <span class="filter-label">Départements</span>
        <div class="filter-buttons">
          <button 
            class="filter-btn"
            [class.active]="(graphicFilter$ | async)?.department === 'ALL'"
            (click)="onDepartmentFilterChange('ALL')"
          >ALL</button>
          <button 
            *ngFor="let dept of departments$ | async"
            class="filter-btn"
            [class.active]="(graphicFilter$ | async)?.department === dept.name"
            (click)="onDepartmentFilterChange(dept.name)"
          >{{dept.name}}</button>
        </div>
      </div>

      <!-- Anatomy Line -->
      <div 
        class="filter-line"
        *ngIf="(graphicFilter$ | async)?.view === 'anatomy'"
      >
        <span class="filter-label">Anatomy</span>
        <div class="filter-buttons">
          <button 
            class="filter-btn"
            [class.active]="(graphicFilter$ | async)?.anatomy === 'ALL'"
            (click)="onAnatomyFilterChange('ALL')"
          >ALL</button>
          <button 
            *ngFor="let region of anatomyRegions$ | async"
            class="filter-btn"
            [class.active]="(graphicFilter$ | async)?.anatomy === region.name"
            (click)="onAnatomyFilterChange(region.name)"
          >{{region.name}}</button>
          <button 
            class="filter-btn"
            [class.active]="(graphicFilter$ | async)?.anatomy === 'Others'"
            (click)="onAnatomyFilterChange('Others')"
          >Others</button>
        </div>
      </div>

      <!-- Timeline Line -->
      <div class="filter-line">
        <span class="filter-label">Timeline</span>
        <div class="filter-buttons">
          <button 
            class="filter-btn"
            [class.active]="(graphicFilter$ | async)?.timeline === 'ALL'"
            (click)="onTimelineFilterChange('ALL')"
          >ALL</button>
          <button 
            class="filter-btn"
            [class.active]="(graphicFilter$ | async)?.timeline === '1 Week'"
            (click)="onTimelineFilterChange('1 Week')"
          >1 Week</button>
          <button 
            class="filter-btn"
            [class.active]="(graphicFilter$ | async)?.timeline === '1 Month'"
            (click)="onTimelineFilterChange('1 Month')"
          >1 Month</button>
          <button 
            class="filter-btn"
            [class.active]="(graphicFilter$ | async)?.timeline === '3 Months'"
            (click)="onTimelineFilterChange('3 Months')"
          >3 Months</button>
          <button 
            class="filter-btn"
            [class.active]="(graphicFilter$ | async)?.timeline === '6 Months'"
            (click)="onTimelineFilterChange('6 Months')"
          >6 Months</button>
          <button 
            class="filter-btn"
            [class.active]="(graphicFilter$ | async)?.timeline === '1 Year'"
            (click)="onTimelineFilterChange('1 Year')"
          >1 Year</button>
          <button 
            class="filter-btn"
            [class.active]="(graphicFilter$ | async)?.timeline === '3 Years'"
            (click)="onTimelineFilterChange('3 Years')"
          >3 Years</button>
          <button 
            class="filter-btn"
            [class.active]="(graphicFilter$ | async)?.timeline === 'More than 3 years'"
            (click)="onTimelineFilterChange('More than 3 years')"
          >More than 3 years</button>
        </div>
      </div>
    </div>
    
    <div class="calendar-map-body">
      <!-- Department Labels (visible only in department view) -->
      <div class="department-labels" 
           *ngIf="(graphicFilter$ | async)?.view === 'department'"
           [style.--department-count]="departmentsList.length"
           #departmentLabelsScroll
           (scroll)="onDepartmentLabelsScroll($event)">
        <div *ngFor="let dept of departmentsList; let i = index" 
             class="department-label"
             [style.top.px]="i * 40 + 10">
          {{dept}}
        </div>
      </div>
      
      <!-- Body Diagram (visible only in anatomy view) -->
      <div class="body-diagram" *ngIf="(graphicFilter$ | async)?.view === 'anatomy'">
        <img 
          src="assets/public/images/skeleton+skin.svg" 
          alt="Human body diagram"
          class="human-body-svg"
        />
      </div>
      
      <div class="timeline-chart">
        <div class="chart-container-wrapper">
          <div class="chart-scroll-container" #chartScrollContainer>
            <div class="chart-vertical-scroll" #chartVerticalScroll (scroll)="onChartVerticalScroll($event)">
              <div class="chart-horizontal-scroll">
                <div class="chart-container"
                     [class.department-view]="(graphicFilter$ | async)?.view === 'department'"
                     [class.anatomy-view]="(graphicFilter$ | async)?.view === 'anatomy'"
                     [style.--department-count]="(graphicFilter$ | async)?.view === 'department' ? (getYAxisLabels() | async)?.length || 0 : 0">
                <ng-container *ngIf="filteredExamPoints$ | async as examPoints">
                  <!-- Y-axis labels -->
                  <div class="y-axis"
                       [class.department-view]="(graphicFilter$ | async)?.view === 'department'"
                       [class.anatomy-view]="(graphicFilter$ | async)?.view === 'anatomy'"
                       [style.--department-count]="(graphicFilter$ | async)?.view === 'department' ? (getYAxisLabels() | async)?.length || 0 : 0">
                    <div *ngFor="let label of (getYAxisLabels() | async) || []; let i = index; trackBy: trackByIndex" 
                         class="y-axis-label"
                         [style.top.px]="(graphicFilter$ | async)?.view === 'department' ? (i + 0.5) * 40 - 10 : null"
                         [style.top.%]="(graphicFilter$ | async)?.view === 'anatomy' ? ((i + 0.5) / ((getYAxisLabels() | async)?.length || 1)) * 100 : null">
                      {{label}}
                    </div>
                  </div>
                  
                  <!-- Chart area -->
                  <div class="chart-area"
                       [class.department-view]="(graphicFilter$ | async)?.view === 'department'"
                       [class.anatomy-view]="(graphicFilter$ | async)?.view === 'anatomy'"
                       >
                    <!-- Region lines -->
                    <div *ngFor="let label of (getYAxisLabels() | async) || []; let i = index; trackBy: trackByIndex" 
                         class="region-line"
                         [style.top.px]="(graphicFilter$ | async)?.view === 'department' ? i * 40 : undefined"
                         [style.height.px]="(graphicFilter$ | async)?.view === 'department' ? 40 : undefined"
                         [style.top.%]="(graphicFilter$ | async)?.view === 'anatomy' ? (i / ((getYAxisLabels() | async)?.length || 1)) * 100 : undefined"
                         [style.height.%]="(graphicFilter$ | async)?.view === 'anatomy' ? (100 / ((getYAxisLabels() | async)?.length || 1)) : undefined"
                         [class.hovered]="hoveredRegion === label || isRegionFiltered(label)"
                         (mouseenter)="onRegionHover(label)"
                         (mouseleave)="onRegionLeave()">
                    </div>
                    
                    <!-- TODAY line -->
                    <div class="today-line"
                         [style.left.%]="getTodayPosition(examPoints)"
                         [style.height.px]="(graphicFilter$ | async)?.view === 'department' ? ((getYAxisLabels() | async)?.length || 0) * 40 : null"
                         [style.height]="(graphicFilter$ | async)?.view === 'anatomy' ? '100%' : null">
                      <div class="today-label">TODAY</div>
                    </div>
                    
                    <!-- Exam points -->
                    <div *ngFor="let examPoint of examPoints" 
                         class="exam-point"
                         [class.future-point]="examPoint.isFuture"
                         [style.left.%]="getExamPointPosition(examPoint, examPoints).x"
                         [style.top.px]="(graphicFilter$ | async)?.view === 'department' ? getExamPointPosition(examPoint, examPoints).y : undefined"
                         [style.top.%]="(graphicFilter$ | async)?.view === 'anatomy' ? getExamPointPosition(examPoint, examPoints).y : undefined"
                         (mouseenter)="onExamPointHover(examPoint, $event)"
                         (mouseleave)="onExamPointLeave()"
                         (click)="onExamPointClick(examPoint)">
                      <div class="exam-point-label" 
                           (mouseenter)="onExamPointHover(examPoint, $event)"
                           (mouseleave)="onExamPointLeave()">
                        {{examPoint.examName}}<br>
                        <small>{{examPoint.date | date:'dd/MM/yy'}}</small>
                      </div>
                    </div>
                  </div>
                  </div>
                </ng-container>
                </div>
              </div>
            </div>
          </div>
          
          <!-- X-axis (fixed at bottom of chart) -->
          <div class="x-axis">
            <ng-container *ngIf="filteredExamPoints$ | async as examPoints">
              <div *ngFor="let timeLabel of getTimelineLabels(examPoints)" 
                   class="x-axis-label"
                   [style.left.%]="timeLabel.position">
                {{timeLabel.label}}
              </div>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./calendar-map-block.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarMapBlockComponent {
  @Input() graphicFilter$!: Observable<GraphicFilter>;
  @Input() departments$!: Observable<Department[]>;
  @Input() anatomyRegions$!: Observable<AnatomyRegion[]>;
  @Input() filteredExamPoints$!: Observable<ExamPoint[]>;
  @Input() departmentsList: string[] = [];
  @Input() hoveredRegion: string | null = null;

  @Output() graphicViewChange = new EventEmitter<'department' | 'anatomy'>();
  @Output() departmentFilterChange = new EventEmitter<string>();
  @Output() anatomyFilterChange = new EventEmitter<string>();
  @Output() timelineFilterChange = new EventEmitter<string>();
  @Output() examPointClick = new EventEmitter<ExamPoint>();
  @Output() examPointHover = new EventEmitter<{examPoint: ExamPoint, event: Event}>();
  @Output() examPointLeave = new EventEmitter<void>();
  @Output() regionHover = new EventEmitter<string>();
  @Output() regionLeave = new EventEmitter<void>();
  @Output() departmentLabelsScroll = new EventEmitter<Event>();
  @Output() chartVerticalScroll = new EventEmitter<Event>();

  onGraphicViewChange(view: 'department' | 'anatomy'): void {
    this.graphicViewChange.emit(view);
  }

  onDepartmentFilterChange(department: string): void {
    this.departmentFilterChange.emit(department);
  }

  onAnatomyFilterChange(anatomy: string): void {
    this.anatomyFilterChange.emit(anatomy);
  }

  onTimelineFilterChange(timeline: string): void {
    this.timelineFilterChange.emit(timeline);
  }

  onExamPointClick(examPoint: ExamPoint): void {
    this.examPointClick.emit(examPoint);
  }

  onExamPointHover(examPoint: ExamPoint, event: Event): void {
    this.examPointHover.emit({examPoint, event});
  }

  onExamPointLeave(): void {
    this.examPointLeave.emit();
  }

  onRegionHover(region: string): void {
    this.regionHover.emit(region);
  }

  onRegionLeave(): void {
    this.regionLeave.emit();
  }

  onDepartmentLabelsScroll(event: Event): void {
    this.departmentLabelsScroll.emit(event);
  }

  onChartVerticalScroll(event: Event): void {
    this.chartVerticalScroll.emit(event);
  }

  // Helper methods that need to be implemented or passed as inputs
  getYAxisLabels(): Observable<string[]> {
    // This should be implemented or passed as input
    return new Observable();
  }

  trackByIndex(index: number): number {
    return index;
  }

  getTodayPosition(examPoints: ExamPoint[]): number {
    // This should be implemented or passed as input
    return 50;
  }

  getExamPointPosition(examPoint: ExamPoint, examPoints: ExamPoint[]): {x: number, y: number} {
    // This should be implemented or passed as input
    return {x: 50, y: 50};
  }

  getTimelineLabels(examPoints: ExamPoint[]): {label: string, position: number}[] {
    // This should be implemented or passed as input
    return [];
  }

  isRegionFiltered(region: string): boolean {
    // This should be implemented or passed as input
    return false;
  }
}