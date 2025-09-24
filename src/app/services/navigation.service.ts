import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, Subject } from 'rxjs';
import { NavSection, NavItem } from '../models/navigation.model';
import { ExamService } from './exam.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private activeNavItem = new BehaviorSubject<string>('inbox');
  private navigationChange = new Subject<string>();
  
  constructor(private examService: ExamService) {}
  
  private getBaseMockNavSections(): NavSection[] {
    return [
      {
        title: 'Boxes',
        items: [
          { id: 'inbox', label: 'Inbox', icon: 'ph ph-inbox-fill', count: 0, isActive: true, route: '/inbox' },
          { id: 'pending', label: 'Pending', icon: 'ph ph-clock-counter-clockwise', count: 0, route: '/pending' },
          { id: 'second-opinion', label: 'Second Opinion', icon: 'ph ph-users-three', count: 0, route: '/second-opinion' },
          { id: 'completed', label: 'Completed', icon: 'ph ph-check-circle', route: '/completed' }
        ]
      },
      {
        title: 'Presets',
        items: [
          { id: 'overdue', label: 'Overdue', icon: 'ph ph-warning-circle', count: 3, isAlert: true, route: '/overdue' },
          { id: 'tumor-board', label: 'Tumor board', icon: 'ph ph-presentation-chart', route: '/tumor-board' },
          { id: 'remote-site', label: 'Remote site', icon: 'ph ph-globe-hemisphere-west', route: '/remote-site' }
        ]
      }
    ];
  }

  private mockNavSections: NavSection[] = [
    {
      title: 'Boxes',
      items: [
        { id: 'inbox', label: 'Inbox', icon: 'ph ph-inbox-fill', count: 17, isActive: true, route: '/inbox' },
        { id: 'pending', label: 'Pending', icon: 'ph ph-clock-counter-clockwise', count: 3, route: '/pending' },
        { id: 'second-opinion', label: 'Second Opinion', icon: 'ph ph-users-three', count: 2, route: '/second-opinion' },
        { id: 'completed', label: 'Completed', icon: 'ph ph-check-circle', route: '/completed' }
      ]
    },
    {
      title: 'Presets',
      items: [
        { id: 'overdue', label: 'Overdue', icon: 'ph ph-warning-circle', count: 3, isAlert: true, route: '/overdue' },
        { id: 'tumor-board', label: 'Tumor board', icon: 'ph ph-presentation-chart', route: '/tumor-board' },
        { id: 'remote-site', label: 'Remote site', icon: 'ph ph-globe-hemisphere-west', route: '/remote-site' }
      ]
    }
  ];


  getById(id: string): Observable<NavItem | null> {
    const allItems = this.mockNavSections.flatMap(section => section.items);
    return of(allItems.find(item => item.id === id) || null).pipe(delay(200));
  }

  search(criteria: { query: string; page: number; pageSize: number }): Observable<{ items: NavItem[]; totalCount: number }> {
    const allItems = this.mockNavSections.flatMap(section => section.items);
    let filteredItems = allItems;

    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      filteredItems = allItems.filter(item => 
        item.label.toLowerCase().includes(query)
      );
    }

    const startIndex = (criteria.page - 1) * criteria.pageSize;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + criteria.pageSize);

    return of({
      items: paginatedItems,
      totalCount: filteredItems.length
    }).pipe(delay(200));
  }

  create(item: Omit<NavItem, 'id'>): Observable<NavItem> {
    const newItem: NavItem = {
      ...item,
      id: Date.now().toString()
    };
    return of(newItem).pipe(delay(200));
  }

  update(id: string, updates: Partial<NavItem>): Observable<NavItem | null> {
    return of(null).pipe(delay(200));
  }

  delete(id: string): Observable<boolean> {
    return of(true).pipe(delay(200));
  }

  getNavSections(): Observable<NavSection[]> {
    return new Observable(observer => {
      // Get current exam counts from ExamService
      this.examService.getExamCountsByCategory().subscribe(counts => {
        const sections = this.getBaseMockNavSections();
        
        // Update counts for each box
        sections[0].items.forEach(item => {
          switch (item.id) {
            case 'inbox':
              item.count = counts.inbox;
              break;
            case 'pending':
              item.count = counts.pending;
              break;
            case 'second-opinion':
              item.count = counts.secondOpinion;
              break;
          }
        });
        
        observer.next(sections);
        observer.complete();
      });
    }).pipe(delay(200));
  }

  getActiveNavItem(): Observable<string> {
    return this.activeNavItem.asObservable();
  }

  setActiveNavItem(itemId: string): void {
    this.activeNavItem.next(itemId);
  }

  triggerNavigationChange(itemId: string): void {
    this.navigationChange.next(itemId);
  }

  getNavigationChange(): Observable<string> {
    return this.navigationChange.asObservable();
  }
}