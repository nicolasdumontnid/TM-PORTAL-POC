import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, map, Subscription } from 'rxjs';
import { NavigationService } from '../../../services/navigation.service';
import { ExamService } from '../../../services/exam.service';

@Component({
  selector: 'app-content-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content-header.component.html',
  styleUrl: './content-header.component.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class ContentHeaderComponent implements OnInit, OnDestroy {
  public searchQuery = '';
  public isSearchFocused = false;
  private isExpandedAllSubject = new BehaviorSubject<boolean>(false);
  isExpandedAll$ = this.isExpandedAllSubject.asObservable();
  showSortDropdown = new BehaviorSubject<boolean>(false);
  currentSort$!: Observable<string>;
  currentSortLabel$!: Observable<string>;
  pageTitle$!: Observable<string>;
  hasExams$: Observable<boolean>;
  private navigationSubscription?: Subscription;

  constructor(
    private navigationService: NavigationService,
    private examService: ExamService
  ) {
    // Initialize hasExams$ in constructor to ensure it's available for template
    this.hasExams$ = this.examService.getAll().pipe(
      map(exams => exams.length > 0)
    );
  }

  ngOnInit(): void {
    this.pageTitle$ = this.navigationService.getActiveNavItem().pipe(
      map(activeItem => {
        switch (activeItem) {
          case 'inbox': return 'Inbox';
          case 'pending': return 'Pending';
          case 'second-opinion': return 'Second Opinion';
          case 'completed': return 'Completed';
          case 'overdue': return 'Overdue';
          case 'tumor-board': return 'Tumor Board';
          case 'remote-site': return 'Remote Site';
          default: return 'Inbox';
        }
      })
    );

    // Initialize sort observables
    this.currentSort$ = this.examService.getCurrentSort();
    this.currentSortLabel$ = this.currentSort$.pipe(
      map(sort => this.getSortLabel(sort))
    );

    // Track if all exams are expanded
    this.examService.getAll().subscribe(exams => {
      const allExpanded = exams.length > 0 && exams.every(exam => exam.isExpanded);
      this.isExpandedAllSubject.next(allExpanded);
    });

    // Listen to navigation changes to reset search
    this.navigationSubscription = this.navigationService.getNavigationChange().subscribe(() => {
      this.searchQuery = '';
      this.examService.setSearchQuery('');
    });
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  expandAllText = this.isExpandedAll$.pipe(
    map(isExpanded => isExpanded ? 'Collapse All' : 'Expand All')
  );

  expandAllClass = this.isExpandedAll$.pipe(
    map(isExpanded => isExpanded ? 'expanded' : '')
  );

  toggleExpandAll(): void {
    console.log('Toggle expand all clicked, current state:', this.isExpandedAllSubject.value);
    if (this.isExpandedAllSubject.value) {
      console.log('Collapsing all exams');
      this.examService.collapseAll().subscribe();
    } else {
      console.log('Expanding all exams');
      this.examService.expandAll().subscribe();
    }
  }
  
  toggleSortDropdown(): void {
    this.showSortDropdown.next(!this.showSortDropdown.value);
  }

  selectSort(sort: string, label: string): void {
    console.log('Header: Selecting sort', sort, label);
    this.examService.setSortOrder(sort);
    this.showSortDropdown.next(false);
  }

  private getSortLabel(sort: string): string {
    switch (sort) {
      case 'date-desc': return 'Date DESC';
      case 'date-asc': return 'Date ASC';
      case 'patient-name-asc': return 'Patient Name ASC';
      case 'patient-name-desc': return 'Patient Name DESC';
      default: return 'Date DESC';
    }
  }

  onSearch(): void {
    this.examService.setSearchQuery(this.searchQuery);
    console.log('Searching for:', this.searchQuery);
  }

  public onSearchFocus(): void {
    this.isSearchFocused = true;
  }

  public onSearchBlur(): void {
    this.isSearchFocused = false;
  }
}