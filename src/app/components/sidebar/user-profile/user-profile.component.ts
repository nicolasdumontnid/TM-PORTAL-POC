import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { ThemeService } from '../../../services/theme.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent implements OnInit {
  @Input() collapsed = false;
  currentUser$!: Observable<User>;
  currentTheme$!: Observable<'light' | 'dark'>;

  constructor(
    private userService: UserService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.userService.getCurrentUser();
    this.currentTheme$ = this.themeService.theme$;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}