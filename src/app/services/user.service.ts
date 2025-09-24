import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  constructor() { }

  getCurrentUser(): Observable<User> {
    // Mock user data - replace with actual API call in production
    const mockUser: User = {
      id: '1',
      name: 'Dr. Marie Dubois',
      email: 'marie.dubois@clinique-parc.fr',
      role: 'Radiologist',
      department: 'Radiology',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      isOnline: true,
      lastActive: new Date()
    };

    return of(mockUser);
  }

  updateUserProfile(user: Partial<User>): Observable<User> {
    // Mock update - replace with actual API call in production
    return this.getCurrentUser();
  }

  getUserById(id: string): Observable<User | null> {
    // Mock implementation - replace with actual API call in production
    if (id === '1') {
      return this.getCurrentUser();
    }
    return of(null);
  }
}