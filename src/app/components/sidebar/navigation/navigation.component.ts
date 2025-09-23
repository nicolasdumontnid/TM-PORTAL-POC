import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { NavigationService } from '../../../services/navigation.service';
import { ExamService } from '../../../services/exam.service';
import { NavSection } from '../../../models/navigation.model';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationComponent implements OnInit {
  navSections$!: Observable<NavSection[]>;
  activeNavItem$!: Observable<string>;

  constructor(
    private navigationService: NavigationService,
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    this.navSections$ = this.navigationService.getNavSections();
    this.activeNavItem$ = this.navigationService.getActiveNavItem();
  }

  onNavItemClick(itemId: string): void {
    // Get current active item
    this.activeNavItem$.subscribe(currentActive => {
      // Only proceed if clicking on a different item
      if (currentActive !== itemId) {
        this.navigationService.setActiveNavItem(itemId);
        
        // Trigger navigation change event
        this.navigationService.triggerNavigationChange(itemId);
        
        // Update exam filter based on navigation
        switch (itemId) {
          case 'inbox':
            this.examService.setFilter('inbox');
            break;
          case 'pending':
            this.examService.setFilter('pending');
            break;
          case 'second-opinion':
            this.examService.setFilter('second-opinion');
            break;
          case 'completed':
            this.examService.setFilter('completed');
            break;
        }
      }
    }).unsubscribe(); // Unsubscribe immediately after getting the value
  }
}