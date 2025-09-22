import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ChatService } from '../../../../services/chat.service';
import { ChatContact, ChatConversation, ChatMessage } from '../../../../models/chat.model';

@Component({
  selector: 'app-chat-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-modal.component.html',
  styleUrl: './chat-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatModalComponent implements OnInit {
  @Input() contact!: ChatContact;
  @Output() close = new EventEmitter<void>();

  conversation$!: Observable<ChatConversation | null>;
  newMessage = '';

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.conversation$ = this.chatService.getConversation(this.contact.id);
  }

  onClose(): void {
    this.close.emit();
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.chatService.sendMessage(this.contact.id, this.newMessage.trim()).subscribe(() => {
        this.newMessage = '';
        // Refresh conversation
        this.conversation$ = this.chatService.getConversation(this.contact.id);
      });
    }
  }

  openExam(): void {
    // This would typically navigate to the exam or open exam details
    console.log('Opening exam for contact:', this.contact.name);
    // For now, just close the modal
    this.onClose();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}