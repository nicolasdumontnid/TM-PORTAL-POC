import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from './navigation/navigation.component';
import { ChatListComponent } from './chat-list/chat-list.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, NavigationComponent, ChatListComponent, UserProfileComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  @Input() collapsed = false;
}