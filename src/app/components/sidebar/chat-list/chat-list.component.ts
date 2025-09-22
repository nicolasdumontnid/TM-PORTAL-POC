import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ChatService } from '../../../services/chat.service';
import { ChatContact } from '../../../models/chat.model';
import { ChatModalComponent } from './chat-modal/chat-modal.component';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, ChatModalComponent],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatListComponent implements OnInit {
  contacts$!: Observable<ChatContact[]>;
  selectedContact: ChatContact | null = null;
  showChatModal = false;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.contacts$ = this.chatService.getAllContacts();
  }

  openChat(contact: ChatContact): void {
    this.selectedContact = contact;
    this.showChatModal = true;
  }

  closeChatModal(): void {
    this.showChatModal = false;
    this.selectedContact = null;
  }
}