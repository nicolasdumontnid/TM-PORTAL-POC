import { Injectable } from '@angular/core';
import { Observable, of, delay, BehaviorSubject } from 'rxjs';
import { ChatContact, ChatMessage, ChatConversation } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private contactsSubject = new BehaviorSubject<ChatContact[]>([]);
  private mockContacts: ChatContact[] = [
    {
      id: '1',
      name: 'CT Scan1',
      avatar: 'assets/public/images/patients.jpg',
      lastMessage: 'Injection?',
      isOnline: false,
      isUnread: true
    },
    {
      id: '2',
      name: 'Dr. Marie Dubois',
      avatar: 'assets/public/images/doctor/doctor2.JPG',
      lastMessage: '15/01/25 - CT Scan...',
      isOnline: true,
      isUnread: false
    },
    {
      id: '3',
      name: 'Dr. Marc Lefebvre',
      avatar: 'assets/public/images/doctor/doctor1.JPG',
      lastMessage: 'Okay, I\'ll check it out.',
      isOnline: true,
      isUnread: false
    }
  ];
  
  private mockConversations: ChatConversation[] = [
    {
      contactId: '1',
      messages: [
        {
          id: '1',
          senderId: '1',
          senderName: 'CT Scan1',
          content: 'Hello, I need clarification on the injection protocol.',
          timestamp: new Date('2025-01-15T10:30:00'),
          isFromCurrentUser: false
        },
        {
          id: '2',
          senderId: 'current',
          senderName: 'Dr. Smith John',
          content: 'What specific information do you need?',
          timestamp: new Date('2025-01-15T10:32:00'),
          isFromCurrentUser: true
        },
        {
          id: '3',
          senderId: '1',
          senderName: 'CT Scan1',
          content: 'Injection?',
          timestamp: new Date('2025-01-15T10:35:00'),
          isFromCurrentUser: false
        }
      ]
    },
    {
      contactId: '2',
      messages: [
        {
          id: '4',
          senderId: '2',
          senderName: 'Dr. Marie Dubois',
          content: '15/01/25 - CT Scan results look concerning. Can you review?',
          timestamp: new Date('2025-01-15T09:15:00'),
          isFromCurrentUser: false
        },
        {
          id: '5',
          senderId: 'current',
          senderName: 'Dr. Smith John',
          content: 'I\'ll take a look right away.',
          timestamp: new Date('2025-01-15T09:20:00'),
          isFromCurrentUser: true
        }
      ]
    },
    {
      contactId: '3',
      messages: [
        {
          id: '6',
          senderId: '3',
          senderName: 'Dr. Marc Lefebvre',
          content: 'The patient\'s follow-up appointment is scheduled.',
          timestamp: new Date('2025-01-15T08:45:00'),
          isFromCurrentUser: false
        },
        {
          id: '7',
          senderId: 'current',
          senderName: 'Dr. Smith John',
          content: 'Okay, I\'ll check it out.',
          timestamp: new Date('2025-01-15T08:50:00'),
          isFromCurrentUser: true
        }
      ]
    }
  ];

  constructor() {
    this.contactsSubject.next([...this.mockContacts]);
  }

  getById(id: string): Observable<ChatContact | null> {
    return of(this.mockContacts.find(contact => contact.id === id) || null).pipe(delay(200));
  }

  search(criteria: { query: string; page: number; pageSize: number }): Observable<{ contacts: ChatContact[]; totalCount: number }> {
    let filteredContacts = [...this.mockContacts];

    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      filteredContacts = filteredContacts.filter(contact => 
        contact.name.toLowerCase().includes(query) ||
        contact.lastMessage.toLowerCase().includes(query)
      );
    }

    const startIndex = (criteria.page - 1) * criteria.pageSize;
    const paginatedContacts = filteredContacts.slice(startIndex, startIndex + criteria.pageSize);

    return of({
      contacts: paginatedContacts,
      totalCount: filteredContacts.length
    }).pipe(delay(200));
  }

  create(contact: Omit<ChatContact, 'id'>): Observable<ChatContact> {
    const newContact: ChatContact = {
      ...contact,
      id: Date.now().toString()
    };
    this.mockContacts.push(newContact);
    this.contactsSubject.next([...this.mockContacts]);
    return of(newContact).pipe(delay(200));
  }

  update(id: string, updates: Partial<ChatContact>): Observable<ChatContact | null> {
    const index = this.mockContacts.findIndex(contact => contact.id === id);
    if (index === -1) {
      return of(null).pipe(delay(200));
    }

    this.mockContacts[index] = { ...this.mockContacts[index], ...updates };
    this.contactsSubject.next([...this.mockContacts]);
    return of(this.mockContacts[index]).pipe(delay(200));
  }

  delete(id: string): Observable<boolean> {
    const index = this.mockContacts.findIndex(contact => contact.id === id);
    if (index === -1) {
      return of(false).pipe(delay(200));
    }

    this.mockContacts.splice(index, 1);
    this.contactsSubject.next([...this.mockContacts]);
    return of(true).pipe(delay(200));
  }

  getAllContacts(): Observable<ChatContact[]> {
    return this.contactsSubject.asObservable();
  }

  getConversation(contactId: string): Observable<ChatConversation | null> {
    const conversation = this.mockConversations.find(conv => conv.contactId === contactId);
    return of(conversation || null).pipe(delay(200));
  }

  sendMessage(contactId: string, content: string): Observable<ChatMessage> {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'current',
      senderName: 'Dr. Smith John',
      content,
      timestamp: new Date(),
      isFromCurrentUser: true
    };

    const conversationIndex = this.mockConversations.findIndex(conv => conv.contactId === contactId);
    if (conversationIndex !== -1) {
      this.mockConversations[conversationIndex].messages.push(newMessage);
    } else {
      this.mockConversations.push({
        contactId,
        messages: [newMessage]
      });
    }

    // Update contact's last message
    const contactIndex = this.mockContacts.findIndex(contact => contact.id === contactId);
    if (contactIndex !== -1) {
      this.mockContacts[contactIndex].lastMessage = content.length > 20 ? content.substring(0, 20) + '...' : content;
      this.contactsSubject.next([...this.mockContacts]);
    }

    return of(newMessage).pipe(delay(200));
  }
}