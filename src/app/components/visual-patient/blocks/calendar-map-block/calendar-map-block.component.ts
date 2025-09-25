import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ExamPoint, GraphicFilter, Department, AnatomyRegion } from '../../../../models/visual-patient.model';

@Component({
  selector: 'app-calendar-map-block',
  standalone: true,
  templateUrl: './calendar-map-block.component.html',
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