import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, Subject } from 'rxjs';
import { NavSection, NavItem } from '../models/navigation.model';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private activeNavItem = new BehaviorSubject<string>('inbox');
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

  constructor() {}

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
    return of([...this.mockNavSections]).pipe(delay(200));
  }

  getActiveNavItem(): Observable<string> {
    return this.activeNavItem.asObservable();
  }

  setActiveNavItem(itemId: string): void {
    this.activeNavItem.next(itemId);
  }
}